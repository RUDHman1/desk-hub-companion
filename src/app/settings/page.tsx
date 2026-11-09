'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDevice } from '@/context/DeviceContext';
import { AUDIO_TONES, getAudioTone, AudioToneOption } from '@/lib/sound';
import { AudioToneId } from '@/types/database';
import {
  Sliders,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Radio,
  Save,
  CheckCircle2,
  Clock,
  Music,
  RotateCcw,
  Cpu,
  Wifi,
  Tv,
  AlertCircle,
  Usb,
  Laptop,
  Zap,
  XCircle,
} from 'lucide-react';

const INTERVAL_PRESETS = [
  { value: 20, name: '20m', desc: 'Cornell', detail: '20 min sit • 2 min active' },
  { value: 25, name: '25m', desc: 'Pomodoro', detail: 'Classic 25 min focus sprint' },
  { value: 30, name: '30m', desc: 'Standard', detail: '30 min ergonomic threshold' },
  { value: 45, name: '45m', desc: 'Deep Sprint', detail: 'Extended deep work limit' },
];

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const {
    playTonePreview,
    stopAudio,
    activeNoteIndex,
    soundEnabled,
    toggleSound,
    audioPreference,
    setAudioPreference,
    connectionStatus,
    hardwareMode,
    connectedPortName,
    isConnecting,
    connectHardware,
    disconnectHardware,
    reconnectHardware,
    switchToSimulatedMode,
    switchToHardwareMode,
    pushSettingsToHardware,
    lastSerialFlash,
  } = useDevice();

  // Local state for configuration form
  const [alertInterval, setAlertInterval] = useState<number>(user.alert_interval || 25);
  const [soundSetting, setSoundSetting] = useState<boolean>(user.sound_enabled ?? true);
  const [selectedAudioTone, setSelectedAudioTone] = useState<AudioToneId | string>(
    user.audio_preference || 'fanfare'
  );
  const [tickerText, setTickerText] = useState<string>(
    user.oled_ticker_text || 'DESK HUB • KEEP ACTIVE • FOCUS 25M'
  );
  const [previewingToneId, setPreviewingToneId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [flashResult, setFlashResult] = useState<{ success: boolean; cmds: string[]; error?: string } | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Derive slider index (0 to 3) matching the 4 interval presets exactly
  const currentIntervalIndex = Math.max(
    0,
    INTERVAL_PRESETS.findIndex((p) => p.value === alertInterval)
  );
  const sliderIndex = currentIntervalIndex >= 0 ? currentIntervalIndex : 1;

  // IR Remote Command Mappings
  const [irMappings] = useState([
    { code: '0xFFA25D', command: 'IR_CMD_RESET', label: 'Reset Timer to Full Interval', active: true },
    { code: '0xFF629D', command: 'IR_CMD_POWER', label: 'Toggle Device Power / Sleep', active: true },
    { code: '0xFFE21D', command: 'IR_CMD_MUTE', label: 'Toggle Piezo Buzzer Mute', active: true },
    { code: '0xFF22DD', command: 'IR_CMD_SNOOZE', label: 'Snooze Timer (+5 Minutes)', active: true },
    { code: '0xFF02FD', command: 'IR_CMD_MICROBREAK', label: 'Trigger Guided 2-Min Break', active: true },
  ]);

  const handleSave = async () => {
    setIsFlashing(true);
    setFlashResult(null);

    // 1. Persist settings to local profile / Supabase
    updateProfile({
      alert_interval: alertInterval,
      sound_enabled: soundSetting,
      audio_preference: selectedAudioTone,
      oled_ticker_text: tickerText,
    });
    setAudioPreference(selectedAudioTone);

    // 2. Push changed settings over serial if the physical device is connected
    const result = await pushSettingsToHardware({
      intervalMinutes: alertInterval,
      soundEnabled: soundSetting,
      tickerText: tickerText,
      audioToneId: selectedAudioTone,
    });

    setFlashResult({ success: result.success, cmds: result.commandsSent, error: result.error });
    setIsFlashing(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setFlashResult(null);
    }, 6000);
  };

  const handlePlayPreview = (toneId: string) => {
    if (previewingToneId === toneId) {
      stopAudio();
      setPreviewingToneId(null);
    } else {
      setPreviewingToneId(toneId);
      playTonePreview(toneId);
    }
  };

  const selectedToneObj = getAudioTone(selectedAudioTone);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-calm-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Device & Hardware Settings
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Firmware Synced
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure sitting intervals, acoustic alert tones, hardware connection mode, and SSD1306 OLED ticker.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isFlashing}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95 min-w-[160px]"
        >
          {isFlashing ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Flashing to Hub…</span>
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Flashed!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Flash Changes to Hub</span>
            </>
          )}
        </button>
      </div>

      {/* Serial Flash Receipt Banner — shown after save */}
      {flashResult && (
        <div
          className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-start gap-3 ${
            flashResult.success
              ? connectionStatus === 'connected'
                ? 'bg-emerald-950/50 border-emerald-700/60'
                : 'bg-sky-950/50 border-sky-700/60'
              : 'bg-red-950/50 border-red-700/60'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {flashResult.success ? (
              connectionStatus === 'connected' ? (
                <Usb className="w-5 h-5 text-emerald-400" />
              ) : (
                <Laptop className="w-5 h-5 text-sky-400" />
              )
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-xs font-semibold mb-1.5 ${
                flashResult.success
                  ? connectionStatus === 'connected'
                    ? 'text-emerald-300'
                    : 'text-sky-300'
                  : 'text-red-300'
              }`}
            >
              {flashResult.success
                ? connectionStatus === 'connected'
                  ? '✓ Commands transmitted to physical Arduino Desk Hub over USB Serial'
                  : '✓ Settings saved — commands staged for next hardware connection'
                : `✗ Serial flash failed: ${flashResult.error}`}
            </p>
            {flashResult.cmds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {flashResult.cmds.map((cmd) => (
                  <code
                    key={cmd}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      connectionStatus === 'connected'
                        ? 'bg-emerald-900/60 text-emerald-200 border-emerald-700/50'
                        : 'bg-sky-900/60 text-sky-200 border-sky-700/50'
                    }`}
                  >
                    {cmd}
                  </code>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid: Interval Calibration & Hardware Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Timer Interval Calibration (Properly Aligned Discrete Slider) */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Sitting Interval Calibration
              </span>
              <span className="text-xs font-mono font-bold text-slate-100 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                {alertInterval} Minutes
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Adjust the physical sitting countdown timer before the Desk Hub transitions into
              chromatic red ALERT mode. Clinical guidelines recommend 20 to 30 minutes.
            </p>

            {/* Pixel-Perfect Discrete Stepped Slider with Direct Notch Alignment */}
            <div className="space-y-6 pt-2">
              <div className="relative select-none py-4">
                {/* Background Track */}
                <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full relative overflow-visible">
                  {/* Active Filled Progress Bar */}
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-200 shadow-sm shadow-emerald-500/50"
                    style={{ width: `${sliderIndex * 33.333}%` }}
                  />

                  {/* 4 Discrete Snap Notches */}
                  {INTERVAL_PRESETS.map((preset, idx) => {
                    const isSelected = alertInterval === preset.value;
                    const isPassed = sliderIndex >= idx;
                    const percentPos = idx * 33.333;

                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setAlertInterval(preset.value)}
                        style={{ left: `${percentPos}%` }}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer group focus:outline-none"
                        title={`Set to ${preset.value} minutes`}
                      >
                        <span
                          className={`rounded-full transition-all duration-200 ${
                            isSelected
                              ? 'w-4 h-4 bg-emerald-400 ring-4 ring-emerald-500/30 shadow-md shadow-emerald-400'
                              : isPassed
                              ? 'w-3 h-3 bg-emerald-500 group-hover:scale-125'
                              : 'w-2.5 h-2.5 bg-slate-700 group-hover:bg-slate-500'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Invisible input range for keyboard accessibility and smooth dragging */}
                <input
                  type="range"
                  min={0}
                  max={INTERVAL_PRESETS.length - 1}
                  step={1}
                  value={sliderIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setAlertInterval(INTERVAL_PRESETS[idx].value);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Sitting Interval Slider"
                />

                {/* Exactly Aligned Label Columns Directly Under Notches */}
                <div className="relative w-full h-12 mt-4">
                  {INTERVAL_PRESETS.map((preset, idx) => {
                    const isSelected = alertInterval === preset.value;
                    const percentPos = idx * 33.333;

                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setAlertInterval(preset.value)}
                        style={{
                          left: `${percentPos}%`,
                          transform: idx === 0 ? 'none' : idx === 3 ? 'translateX(-100%)' : 'translateX(-50%)',
                          textAlign: idx === 0 ? 'left' : idx === 3 ? 'right' : 'center',
                        }}
                        className={`absolute top-0 flex flex-col group transition-all cursor-pointer focus:outline-none ${
                          isSelected ? 'text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xs font-mono font-semibold tracking-tight">{preset.name}</span>
                        <span
                          className={`text-[10px] whitespace-nowrap mt-0.5 ${
                            isSelected ? 'text-emerald-400 font-medium' : 'text-slate-500 group-hover:text-slate-400'
                          }`}
                        >
                          ({preset.desc})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Preset Buttons with Contextual Ergonomic Descriptions */}
            <div className="grid grid-cols-4 gap-2 mt-6">
              {INTERVAL_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setAlertInterval(preset.value)}
                  className={`py-2 rounded-xl text-xs font-mono font-semibold transition-all border ${
                    alertInterval === preset.value
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 font-mono mt-3 text-center">
              Active Protocol: <span className="text-emerald-300">{INTERVAL_PRESETS[sliderIndex].detail}</span>
            </p>
          </div>
        </div>

        {/* Card 2: Hardware Link & Connection Management (Physical vs Simulated) */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase text-sky-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Connection & Device Link Mode
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : connectionStatus === 'simulated'
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}
              >
                ● {connectionStatus.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Operate in <strong>Simulated Mode</strong> for in-browser testing, or pair directly with an
              actual <strong>Arduino / ESP32 Desk Hub</strong> over USB Serial.
            </p>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4">
              <button
                type="button"
                onClick={switchToSimulatedMode}
                className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  hardwareMode === 'simulated'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Simulated Mode (WFH)</span>
              </button>

              <button
                type="button"
                onClick={switchToHardwareMode}
                className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  hardwareMode === 'hardware'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Usb className="w-3.5 h-3.5" />
                <span>Physical Desk Hub</span>
              </button>
            </div>

            {/* Conditional Status Banner based on Mode */}
            {hardwareMode === 'simulated' ? (
              <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-800/50 space-y-2">
                <div className="flex items-center gap-2 text-sky-300 text-xs font-semibold">
                  <Laptop className="w-4 h-4 text-sky-400" />
                  <span>Virtual Companion Firmware Active</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Timers, chromatic alerts, IR remote triggers, and microbreaks run in-browser without
                  requiring plugged-in hardware.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    switchToHardwareMode();
                    await connectHardware();
                  }}
                  className="w-full mt-1 py-2 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-all border border-sky-500/30"
                >
                  <Usb className="w-3.5 h-3.5" />
                  <span>Connect Physical Desk Hub</span>
                </button>
              </div>
            ) : (
              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-950/40 border-emerald-800/50'
                    : 'bg-red-950/40 border-red-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold flex items-center gap-2 ${
                      connectionStatus === 'connected' ? 'text-emerald-300' : 'text-red-300'
                    }`}
                  >
                    <Usb className="w-4 h-4" />
                    <span>
                      {connectionStatus === 'connected'
                        ? 'Hardware Connected & Paired'
                        : 'Hardware Disconnected / Unplugged'}
                    </span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">115200 Baud</span>
                </div>

                <p className="text-[11px] text-slate-400 font-mono">
                  {connectedPortName || 'No active USB serial connection detected.'}
                </p>

                <div className="flex gap-2 pt-1">
                  {connectionStatus === 'connected' ? (
                    <button
                      type="button"
                      onClick={disconnectHardware}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-mono transition-all border border-red-500/30"
                    >
                      Disconnect Port
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={connectHardware}
                        disabled={isConnecting}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        {isConnecting ? 'Connecting...' : 'Connect USB Hub'}
                      </button>
                      <button
                        type="button"
                        onClick={reconnectHardware}
                        disabled={isConnecting}
                        className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-all border border-slate-700"
                        title="Scan known ports"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Audio Chimes & Piezo Melodies Library */}
      <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-calm-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                <Music className="w-5 h-5 text-sky-400" />
                Piezo Buzzer & Alert Audio Library
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                8 Acoustic Presets
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select the acoustic alert melody rendered through the physical piezoelectric buzzer or companion speakers when an alert fires.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
                soundEnabled
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/15 text-red-400 border-red-500/30'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Audio Enabled' : 'Buzzer Muted'}</span>
            </button>

            <button
              onClick={() => handlePlayPreview(selectedAudioTone)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              {previewingToneId === selectedAudioTone ? (
                <>
                  <Square className="w-3.5 h-3.5 text-amber-400" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Active Tone</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 8 Audio Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {AUDIO_TONES.map((tone: AudioToneOption) => {
            const isSelected = selectedAudioTone === tone.id;
            const isPlayingThis = previewingToneId === tone.id;

            return (
              <div
                key={tone.id}
                onClick={() => setSelectedAudioTone(tone.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800/90 text-slate-400 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-mono uppercase px-2 py-0.5 rounded text-[10px] border ${
                        tone.category === 'Calm & Zen'
                          ? 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                          : tone.category === 'Retro & Sci-Fi'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      }`}
                    >
                      {tone.category}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400">
                      Wave: {tone.waveform}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                    {tone.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {tone.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPreview(tone.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-all ${
                      isPlayingThis
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/70'
                    }`}
                  >
                    {isPlayingThis ? (
                      <>
                        <Square className="w-3.5 h-3.5 text-amber-400" />
                        <span className="flex items-center gap-1 font-semibold">
                          <span>Playing</span>
                          <span className="flex items-end gap-0.5 h-3 ml-1">
                            <span className="w-0.5 h-3 bg-amber-400 animate-pulse" />
                            <span className="w-0.5 h-1.5 bg-amber-400 animate-ping" />
                            <span className="w-0.5 h-2.5 bg-amber-400 animate-pulse" />
                          </span>
                        </span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Preview Tone</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      {isSelected ? 'Active Selection' : 'Select'}
                    </span>
                    <input
                      type="radio"
                      name="audioToneSelection"
                      checked={isSelected}
                      onChange={() => setSelectedAudioTone(tone.id)}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hardware Pairing & IR Remote Status */}
      <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400" />
              Hardware Pairing & IR Remote Command Mapping
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Physical microcontroller connection status and hex signal lookup table for TSOP4838 IR receiver.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-mono border flex items-center gap-1.5 ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : connectionStatus === 'simulated'
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Link: {connectionStatus.toUpperCase()}</span>
            </span>
          </div>
        </div>

        {/* IR Remote Mapping Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-calm-border/60 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-medium">IR HEX CODE</th>
                <th className="pb-3 font-medium">COMMAND IDENTIFIER</th>
                <th className="pb-3 font-medium">BEHAVIORAL ACTION</th>
                <th className="pb-3 font-medium text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {irMappings.map((mapping) => (
                <tr key={mapping.code} className="hover:bg-slate-900/40">
                  <td className="py-2.5 font-bold text-sky-400">{mapping.code}</td>
                  <td className="py-2.5 text-slate-300">{mapping.command}</td>
                  <td className="py-2.5 text-slate-400 font-sans text-xs">{mapping.label}</td>
                  <td className="py-2.5 text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      PAIRED & ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OLED Ticker Text Customization */}
      <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Tv className="w-5 h-5 text-sky-400" />
              SSD1306 OLED Ticker Text Customization
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Custom scroll text rendered across the 128x64 display during FOCUS mode.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={tickerText}
            onChange={(e) => setTickerText(e.target.value)}
            maxLength={60}
            placeholder="DESK HUB • KEEP ACTIVE • FOCUS 25M"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm font-mono focus:border-emerald-500 outline-none transition-all"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>Preview in live hardware widget on Dashboard</span>
            <span>{tickerText.length} / 60 characters</span>
          </div>
        </div>
      </div>
    </div>
  );
}
