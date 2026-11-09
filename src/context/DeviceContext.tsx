'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { DeviceMode, TriggerSource, ConnectionStatus, DeviceHardwareMode, AudioToneId } from '@/types/database';
import { useAuth } from './AuthContext';
import { dbStore } from '@/lib/supabase/client';
import {
  playAlertBuzzer,
  playMelody,
  stopMelody,
  playGentleBell,
  playToneById,
  getAudioTone,
  AUDIO_TONES,
} from '@/lib/sound';

export type { ConnectionStatus, DeviceHardwareMode };

interface DeviceContextType {
  hardwareMode: DeviceHardwareMode;
  connectionStatus: ConnectionStatus;
  connectedPortName: string | null;
  isConnecting: boolean;
  devicePoweredOn: boolean;
  currentMode: DeviceMode;
  soundEnabled: boolean;
  audioPreference: AudioToneId | string;
  remainingSeconds: number;
  totalIntervalSeconds: number;
  isTimerRunning: boolean;
  activeNoteIndex: number | null;
  tickerText: string;
  sedentaryMinutesToday: number;
  currentSedentaryZone: 'green' | 'yellow' | 'red';
  lastResponseLatencySec: number | null;
  simulateIrCommand: (cmd: 'IR_CMD_RESET' | 'IR_CMD_POWER' | 'IR_CMD_MUTE' | 'IR_CMD_SNOOZE') => void;
  snoozeHub: (minutes?: number) => void;
  triggerSimulatedAlert: () => void;
  triggerBreakComplete: (protocolName: string, durationSec: number) => void;
  toggleSound: () => void;
  setAudioPreference: (pref: AudioToneId | string) => void;
  playFanfarePreview: () => void;
  playTonePreview: (toneId?: string) => void;
  stopAudio: () => void;
  // Serial write channel to physical Arduino
  sendSerialCommand: (cmd: string) => Promise<boolean>;
  pushSettingsToHardware: (opts: HardwarePushOptions) => Promise<SerialFlashResult>;
  lastSerialFlash: SerialFlashResult | null;
  // Explicit hardware connection methods
  connectHardware: () => Promise<boolean>;
  disconnectHardware: () => Promise<void>;
  reconnectHardware: () => Promise<boolean>;
  switchToSimulatedMode: () => void;
  switchToHardwareMode: () => void;
  toggleConnection: () => void;
}

/** Parameters accepted by pushSettingsToHardware */
export interface HardwarePushOptions {
  intervalMinutes?: number;
  soundEnabled?: boolean;
  tickerText?: string;
  audioToneId?: string;
}

/** Result returned after attempting to flash settings to the Arduino */
export interface SerialFlashResult {
  success: boolean;
  commandsSent: string[];
  error?: string;
  timestamp: string;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useAuth();

  // Mode: 'simulated' vs 'hardware'
  const [hardwareMode, setHardwareMode] = useState<DeviceHardwareMode>('simulated');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('simulated');
  const [connectedPortName, setConnectedPortName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const [devicePoweredOn, setDevicePoweredOn] = useState<boolean>(true);
  const [currentMode, setCurrentMode] = useState<DeviceMode>('FOCUS');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(user.sound_enabled ?? true);
  const [audioPreference, setAudioPreferenceState] = useState<AudioToneId | string>(
    user.audio_preference || 'fanfare'
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number>((user.alert_interval || 25) * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);
  const [sedentaryMinutesToday, setSedentaryMinutesToday] = useState<number>(0);
  const [lastResponseLatencySec, setLastResponseLatencySec] = useState<number | null>(null);
  const [lastSerialFlash, setLastSerialFlash] = useState<SerialFlashResult | null>(null);

  const alertStartTimeRef = useRef<number | null>(null);
  const serialPortRef = useRef<any>(null);
  const serialWriterRef = useRef<WritableStreamDefaultWriter | null>(null);
  const totalIntervalSeconds = (user.alert_interval || 25) * 60;
  const tickerText = user.oled_ticker_text || 'DESK HUB • KEEP ACTIVE • FOCUS 25M';

  // Synchronize with user profile alert_interval and sound_enabled when user changes
  useEffect(() => {
    setSoundEnabled(user.sound_enabled);
    setAudioPreferenceState(user.audio_preference || 'fanfare');
    setRemainingSeconds((user.alert_interval || 25) * 60);
  }, [user.id, user.alert_interval, user.sound_enabled, user.audio_preference]);

  // WebSerial disconnect listener: automatically detects when the physical cable is unplugged
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const navSerial = (navigator as any).serial;
    if (!navSerial) return;

    const handleDisconnect = (event: any) => {
      console.log('WebSerial device disconnected:', event);
      serialPortRef.current = null;
      setConnectedPortName(null);
      if (hardwareMode === 'hardware') {
        setConnectionStatus('disconnected');
      }
    };

    const handleConnect = (event: any) => {
      console.log('WebSerial device connected:', event);
      if (hardwareMode === 'hardware') {
        // Automatically attempt reconnect when device re-plugged
        reconnectHardware();
      }
    };

    try {
      navSerial.addEventListener('disconnect', handleDisconnect);
      navSerial.addEventListener('connect', handleConnect);
    } catch (e) {
      // Ignore if event listener not supported
    }

    return () => {
      try {
        navSerial.removeEventListener('disconnect', handleDisconnect);
        navSerial.removeEventListener('connect', handleConnect);
      } catch (e) {}
    };
  }, [hardwareMode]);

  // Determine current sedentary zone
  const elapsedSittingSec = totalIntervalSeconds - remainingSeconds;
  const currentSedentaryZone: 'green' | 'yellow' | 'red' =
    currentMode === 'ALERT' || elapsedSittingSec >= 3600
      ? 'red'
      : elapsedSittingSec >= 1200
      ? 'yellow'
      : 'green';

  // Timer Tick Interval
  useEffect(() => {
    if (!devicePoweredOn || !isTimerRunning) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Timer expired -> Trigger ALERT Mode
          triggerAlertMode('AUTO_TIMEOUT');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [devicePoweredOn, isTimerRunning, user.alert_interval, soundEnabled]);

  // Periodic zone accumulation tracking into daily_analytics
  useEffect(() => {
    if (!devicePoweredOn) return;
    const interval = setInterval(() => {
      const zone = currentMode === 'ALERT' ? 'red' : remainingSeconds < 300 ? 'yellow' : 'yellow';
      dbStore.recordDailyZoneMinute(user.id, zone, 1);
      setSedentaryMinutesToday((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, [devicePoweredOn, currentMode, remainingSeconds, user.id]);

  const triggerAlertMode = useCallback(
    (source: TriggerSource = 'AUTO_TIMEOUT') => {
      setCurrentMode('ALERT');
      setIsTimerRunning(false);
      alertStartTimeRef.current = Date.now();

      // Play alert melody based on chosen audio tone
      if (soundEnabled) {
        if (user.custom_melody && user.custom_melody.length > 0) {
          playMelody(
            user.custom_melody,
            true,
            (idx) => setActiveNoteIndex(idx),
            () => setActiveNoteIndex(null)
          );
        } else {
          playToneById(
            audioPreference,
            true,
            (idx) => setActiveNoteIndex(idx),
            () => setActiveNoteIndex(null)
          );
        }
      }

      // Log alert telemetry
      dbStore.addTelemetry({
        user_id: user.id,
        user_name: user.display_name,
        department: user.department,
        device_id: user.device_id,
        device_powered_on: true,
        current_mode: 'ALERT',
        trigger_source: source,
        session_duration_seconds: totalIntervalSeconds,
      });
    },
    [soundEnabled, audioPreference, user.custom_melody, user.display_name, user.department, user.device_id, user.id, totalIntervalSeconds]
  );

  const setAudioPreference = (pref: AudioToneId | string) => {
    setAudioPreferenceState(pref);
    updateProfile({ audio_preference: pref });
  };

  // Forward IR simulation commands to physical Arduino if connected over serial
  const forwardSerialIfConnected = (cmd: string) => {
    if (connectionStatus === 'connected' && serialPortRef.current) {
      sendSerialCommand(cmd);
    }
  };

  const simulateIrCommand = (cmd: 'IR_CMD_RESET' | 'IR_CMD_POWER' | 'IR_CMD_MUTE' | 'IR_CMD_SNOOZE') => {
    stopMelody();
    setActiveNoteIndex(null);

    // Forward to physical Arduino firmware
    if (cmd === 'IR_CMD_RESET') forwardSerialIfConnected('CMD_RESET');
    else if (cmd === 'IR_CMD_SNOOZE') forwardSerialIfConnected('CMD_SNOOZE');
    else if (cmd === 'IR_CMD_POWER') forwardSerialIfConnected('CMD_POWER');
    else if (cmd === 'IR_CMD_MUTE') forwardSerialIfConnected('CMD_MUTE');

    let latencySec = 0;
    if (currentMode === 'ALERT' && alertStartTimeRef.current) {
      latencySec = Math.max(Math.round((Date.now() - alertStartTimeRef.current) / 1000), 1);
      setLastResponseLatencySec(latencySec);
      alertStartTimeRef.current = null;
    }

    if (cmd === 'IR_CMD_RESET') {
      setRemainingSeconds(totalIntervalSeconds);
      setCurrentMode('FOCUS');
      setIsTimerRunning(true);

      if (latencySec > 0) {
        dbStore.recordAlertResolution(user.id, latencySec, 'IR_CMD_RESET', 'manual_dismiss');
      } else {
        dbStore.addTelemetry({
          user_id: user.id,
          user_name: user.display_name,
          department: user.department,
          device_id: user.device_id,
          device_powered_on: devicePoweredOn,
          current_mode: 'FOCUS',
          trigger_source: 'IR_CMD_RESET',
          session_duration_seconds: totalIntervalSeconds,
        });
      }
    } else if (cmd === 'IR_CMD_SNOOZE') {
      setRemainingSeconds(300); // 5 minutes
      setCurrentMode('FOCUS');
      setIsTimerRunning(true);

      if (latencySec > 0) {
        dbStore.recordAlertResolution(user.id, latencySec, 'IR_CMD_SNOOZE', 'manual_dismiss');
      } else {
        dbStore.addTelemetry({
          user_id: user.id,
          user_name: user.display_name,
          department: user.department,
          device_id: user.device_id,
          device_powered_on: devicePoweredOn,
          current_mode: 'FOCUS',
          trigger_source: 'IR_CMD_SNOOZE',
          session_duration_seconds: 300,
        });
      }
    } else if (cmd === 'IR_CMD_POWER') {
      const newPowerState = !devicePoweredOn;
      setDevicePoweredOn(newPowerState);
      const newMode = newPowerState ? 'FOCUS' : 'OFF';
      setCurrentMode(newMode);
      if (!newPowerState) {
        setIsTimerRunning(false);
      } else {
        setRemainingSeconds(totalIntervalSeconds);
        setIsTimerRunning(true);
      }

      dbStore.addTelemetry({
        user_id: user.id,
        user_name: user.display_name,
        department: user.department,
        device_id: user.device_id,
        device_powered_on: newPowerState,
        current_mode: newMode,
        trigger_source: 'IR_CMD_POWER',
        session_duration_seconds: 0,
      });
    } else if (cmd === 'IR_CMD_MUTE') {
      const newMute = !soundEnabled;
      setSoundEnabled(newMute);
      updateProfile({ sound_enabled: newMute });

      dbStore.addTelemetry({
        user_id: user.id,
        user_name: user.display_name,
        department: user.department,
        device_id: user.device_id,
        device_powered_on: devicePoweredOn,
        current_mode: currentMode,
        trigger_source: 'IR_CMD_MUTE',
        session_duration_seconds: 0,
      });
    }
  };

  const snoozeHub = (minutes = 5) => {
    simulateIrCommand('IR_CMD_SNOOZE');
  };

  const triggerSimulatedAlert = () => {
    triggerAlertMode('WEB_SIMULATOR');
  };

  const triggerBreakComplete = (protocolName: string, durationSec: number) => {
    stopMelody();
    setActiveNoteIndex(null);
    playGentleBell();

    let latencySec = 0;
    if (currentMode === 'ALERT' && alertStartTimeRef.current) {
      latencySec = Math.max(Math.round((Date.now() - alertStartTimeRef.current) / 1000), 1);
      setLastResponseLatencySec(latencySec);
      alertStartTimeRef.current = null;
    }

    dbStore.addMicrobreak({
      user_id: user.id,
      user_name: user.display_name,
      protocol_type: protocolName,
      duration_seconds: durationSec,
    });

    setRemainingSeconds(totalIntervalSeconds);
    setCurrentMode('FOCUS');
    setIsTimerRunning(true);

    if (latencySec > 0) {
      dbStore.recordAlertResolution(user.id, latencySec, 'MICROBREAK_FINISH', 'microbreak_cleared');
    } else {
      dbStore.addTelemetry({
        user_id: user.id,
        user_name: user.display_name,
        department: user.department,
        device_id: user.device_id,
        device_powered_on: true,
        current_mode: 'FOCUS',
        trigger_source: 'MICROBREAK_FINISH',
        session_duration_seconds: durationSec,
      });
    }
  };

  // Connection Management: Hardware vs Simulated
  const switchToSimulatedMode = () => {
    setHardwareMode('simulated');
    setConnectionStatus('simulated');
  };

  const switchToHardwareMode = () => {
    setHardwareMode('hardware');
    if (serialPortRef.current) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  };

  // Incoming serial stream listener from physical Arduino
  const startSerialReader = async (port: any) => {
    try {
      const textDecoder = new TextDecoder();
      let lineBuffer = '';

      while (port && port.readable) {
        const reader = port.readable.getReader();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              lineBuffer += textDecoder.decode(value, { stream: true });
              const lines = lineBuffer.split('\n');
              lineBuffer = lines.pop() || '';
              for (const rawLine of lines) {
                const line = rawLine.trim();
                if (line.length > 0) {
                  console.info(`[ArduinoRX] ${line}`);

                  // 1. Alert triggered by Arduino timer
                  if (line.includes('ALERT: Time to stand up!')) {
                    setCurrentMode('ALERT');
                    setIsTimerRunning(false);
                    alertStartTimeRef.current = Date.now();
                  }
                  // 2. Arduino button or remote reset
                  else if (
                    line.includes('-> RESET:') ||
                    line.includes('Button Reset!') ||
                    line.includes('-> OK: RESET')
                  ) {
                    stopMelody();
                    setActiveNoteIndex(null);
                    let latencySec = 0;
                    if (currentMode === 'ALERT' && alertStartTimeRef.current) {
                      latencySec = Math.max(Math.round((Date.now() - alertStartTimeRef.current) / 1000), 1);
                      setLastResponseLatencySec(latencySec);
                      alertStartTimeRef.current = null;
                      dbStore.recordAlertResolution(user.id, latencySec, 'PIR_SENSOR', 'manual_dismiss');
                    }
                    setRemainingSeconds(totalIntervalSeconds);
                    setCurrentMode('FOCUS');
                    setIsTimerRunning(true);
                  }
                  // 3. Power status notifications from Arduino
                  else if (line.includes('-> SYSTEM: Powered OFF')) {
                    setDevicePoweredOn(false);
                    setCurrentMode('OFF');
                    setIsTimerRunning(false);
                  } else if (line.includes('-> SYSTEM: Powered ON')) {
                    setDevicePoweredOn(true);
                    setCurrentMode('FOCUS');
                    setRemainingSeconds(totalIntervalSeconds);
                    setIsTimerRunning(true);
                  }
                  // 4. Mute status from Arduino
                  else if (line.includes('-> SOUND: UNMUTED')) {
                    setSoundEnabled(true);
                  } else if (line.includes('-> SOUND: MUTED')) {
                    setSoundEnabled(false);
                  }
                }
              }
            }
          }
        } catch (readErr) {
          console.warn('[SerialRX] Read loop interrupted:', readErr);
          break;
        } finally {
          try {
            reader.releaseLock();
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('[SerialRX] Top-level reader error:', err);
    }
  };

  // Connect Physical Arduino Desk Hub via WebSerial or Virtual Link
  const connectHardware = async (): Promise<boolean> => {
    setIsConnecting(true);
    setHardwareMode('hardware');

    const nav = typeof window !== 'undefined' ? (navigator as any) : null;
    if (nav && 'serial' in nav) {
      try {
        const port = await nav.serial.requestPort();
        // Use 9600 baud rate matching Serial.begin(9600) on Arduino
        await port.open({ baudRate: 9600 });
        serialPortRef.current = port;
        const portInfo = port.getInfo ? port.getInfo() : {};
        const portLabel = portInfo.usbProductId
          ? `USB Hub (VID:0x${portInfo.usbVendorId?.toString(16)}, PID:0x${portInfo.usbProductId?.toString(16)})`
          : 'Arduino Desk Hub (9600 Baud)';
        setConnectedPortName(portLabel);
        setConnectionStatus('connected');
        setIsConnecting(false);

        // Start listening to incoming events from the Arduino
        startSerialReader(port);

        // Automatically sync current interval to Arduino on connection
        const currentMins = Math.round(totalIntervalSeconds / 60);
        setTimeout(() => {
          sendSerialCommand(`SET_INTERVAL:${currentMins}`);
        }, 800);

        return true;
      } catch (err: any) {
        console.warn('WebSerial connection cancelled or failed:', err);
        setConnectionStatus('disconnected');
        setIsConnecting(false);
        return false;
      }
    } else {
      // Browser does not support WebSerial (e.g., Firefox/Safari or non-HTTPS)
      await new Promise((resolve) => setTimeout(resolve, 600));
      setConnectedPortName('Arduino Desk Hub (Emulated COM4)');
      setConnectionStatus('connected');
      setIsConnecting(false);
      return true;
    }
  };

  const disconnectHardware = async () => {
    if (serialPortRef.current) {
      try {
        await serialPortRef.current.close();
      } catch (e) {
        console.warn('Error closing serial port:', e);
      }
      serialPortRef.current = null;
    }
    setConnectedPortName(null);
    if (hardwareMode === 'hardware') {
      setConnectionStatus('disconnected');
    }
  };

  const reconnectHardware = async (): Promise<boolean> => {
    setIsConnecting(true);
    const nav = typeof window !== 'undefined' ? (navigator as any) : null;
    if (nav && 'serial' in nav) {
      try {
        const ports = await nav.serial.getPorts();
        if (ports && ports.length > 0) {
          const port = ports[0];
          await port.open({ baudRate: 9600 });
          serialPortRef.current = port;
          setConnectedPortName('Arduino Desk Hub (Auto-Reconnected 9600)');
          setConnectionStatus('connected');
          setIsConnecting(false);
          startSerialReader(port);
          return true;
        }
      } catch (e) {
        console.warn('Auto-reconnect failed:', e);
      }
    }
    return connectHardware();
  };

  // Safe wrapper for toggle
  const toggleConnection = () => {
    if (hardwareMode === 'simulated') {
      // Switch to hardware mode and attempt connection
      switchToHardwareMode();
      connectHardware();
    } else {
      // In hardware mode: toggle connect / disconnect
      if (connectionStatus === 'connected') {
        disconnectHardware();
      } else {
        connectHardware();
      }
    }
  };

  // ─── WebSerial Write Channel ───────────────────────────────────────────────
  /**
   * Low-level serial write. Sends a single UTF-8 newline-terminated command
   * string to the connected Arduino over the WebSerial writable stream.
   *
   * Returns true on success, false if not connected or write fails.
   * The Arduino firmware should call Serial.readStringUntil('\n') to receive.
   */
  const sendSerialCommand = async (cmd: string): Promise<boolean> => {
    if (!serialPortRef.current || connectionStatus !== 'connected') {
      return false;
    }

    try {
      const port = serialPortRef.current;
      // Obtain a one-shot writer; always release the lock after writing
      const writer: WritableStreamDefaultWriter = port.writable.getWriter();
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(cmd + '\n'));
      writer.releaseLock();
      console.info(`[SerialTX] → ${cmd}`);
      return true;
    } catch (err) {
      console.warn('[SerialTX] Write failed:', err);
      return false;
    }
  };

  /**
   * High-level helper: flash one or more device settings to the Arduino.
   *
   * Protocol (all commands terminated with \n):
   *   SET_INTERVAL:<minutes>     e.g. "SET_INTERVAL:25"
   *   SET_SOUND:<0|1>            e.g. "SET_SOUND:1"
   *   SET_TICKER:<text>          e.g. "SET_TICKER:DESK HUB • FOCUS"
   *   SET_TONE:<toneId>          e.g. "SET_TONE:fanfare"
   *
   * In Simulated Mode returns a mock success result with no actual serial I/O.
   */
  const pushSettingsToHardware = async (opts: HardwarePushOptions): Promise<SerialFlashResult> => {
    const commandsSent: string[] = [];
    const timestamp = new Date().toISOString();

    if (hardwareMode === 'simulated' || connectionStatus !== 'connected') {
      // Simulated mode: just log the commands that would have been sent
      if (opts.intervalMinutes !== undefined)
        commandsSent.push(`SET_INTERVAL:${opts.intervalMinutes}`);
      if (opts.soundEnabled !== undefined)
        commandsSent.push(`SET_SOUND:${opts.soundEnabled ? 1 : 0}`);
      if (opts.tickerText !== undefined)
        commandsSent.push(`SET_TICKER:${opts.tickerText.substring(0, 60)}`);
      if (opts.audioToneId !== undefined)
        commandsSent.push(`SET_TONE:${opts.audioToneId}`);

      const result: SerialFlashResult = {
        success: true,
        commandsSent,
        timestamp,
      };
      setLastSerialFlash(result);
      return result;
    }

    // Hardware mode: send each command over the live serial port
    try {
      if (opts.intervalMinutes !== undefined) {
        const cmd = `SET_INTERVAL:${opts.intervalMinutes}`;
        const ok = await sendSerialCommand(cmd);
        if (ok) commandsSent.push(cmd);
      }

      if (opts.soundEnabled !== undefined) {
        const cmd = `SET_SOUND:${opts.soundEnabled ? 1 : 0}`;
        const ok = await sendSerialCommand(cmd);
        if (ok) commandsSent.push(cmd);
      }

      if (opts.tickerText !== undefined) {
        // Clamp OLED text to 60 chars — matching the SSD1306 buffer constraint
        const cmd = `SET_TICKER:${opts.tickerText.substring(0, 60)}`;
        const ok = await sendSerialCommand(cmd);
        if (ok) commandsSent.push(cmd);
      }

      if (opts.audioToneId !== undefined) {
        // Useful for future Arduino firmware extensions (custom PROGMEM melody arrays)
        const cmd = `SET_TONE:${opts.audioToneId}`;
        const ok = await sendSerialCommand(cmd);
        if (ok) commandsSent.push(cmd);
      }

      const result: SerialFlashResult = { success: true, commandsSent, timestamp };
      setLastSerialFlash(result);
      return result;
    } catch (err: any) {
      const result: SerialFlashResult = {
        success: false,
        commandsSent,
        error: err?.message || 'Unknown serial write error',
        timestamp,
      };
      setLastSerialFlash(result);
      return result;
    }
  };
  // ─── End Serial Write Channel ───────────────────────────────────────────────

  const toggleSound = () => {
    simulateIrCommand('IR_CMD_MUTE');
  };

  const playTonePreview = (toneId?: string) => {
    const targetTone = toneId || audioPreference;
    playToneById(
      targetTone,
      true,
      (idx) => setActiveNoteIndex(idx),
      () => setActiveNoteIndex(null)
    );
  };

  const playFanfarePreview = () => {
    playTonePreview();
  };

  const stopAudio = () => {
    stopMelody();
    setActiveNoteIndex(null);
  };

  return (
    <DeviceContext.Provider
      value={{
        hardwareMode,
        connectionStatus,
        connectedPortName,
        isConnecting,
        devicePoweredOn,
        currentMode,
        soundEnabled,
        audioPreference,
        remainingSeconds,
        totalIntervalSeconds,
        isTimerRunning,
        activeNoteIndex,
        tickerText,
        sedentaryMinutesToday,
        currentSedentaryZone,
        lastResponseLatencySec,
        simulateIrCommand,
        snoozeHub,
        triggerSimulatedAlert,
        triggerBreakComplete,
        toggleSound,
        setAudioPreference,
        playFanfarePreview,
        playTonePreview,
        stopAudio,
        sendSerialCommand,
        pushSettingsToHardware,
        lastSerialFlash,
        connectHardware,
        disconnectHardware,
        reconnectHardware,
        switchToSimulatedMode,
        switchToHardwareMode,
        toggleConnection,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
}
