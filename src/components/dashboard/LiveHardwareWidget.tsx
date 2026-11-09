'use client';

import React from 'react';
import { useDevice } from '@/context/DeviceContext';
import { getAudioTone } from '@/lib/sound';
import {
  Cpu,
  Power,
  RotateCcw,
  Volume2,
  VolumeX,
  Radio,
  BellRing,
  Sparkles,
  Play,
  Square,
  AlarmClockOff,
  Flame,
  CheckCircle2,
  Usb,
  Laptop,
} from 'lucide-react';
import Link from 'next/link';

export function LiveHardwareWidget() {
  const {
    currentMode,
    connectionStatus,
    hardwareMode,
    connectedPortName,
    isConnecting,
    soundEnabled,
    audioPreference,
    remainingSeconds,
    totalIntervalSeconds,
    devicePoweredOn,
    tickerText,
    lastResponseLatencySec,
    simulateIrCommand,
    snoozeHub,
    triggerSimulatedAlert,
    playFanfarePreview,
    stopAudio,
    activeNoteIndex,
    connectHardware,
    disconnectHardware,
    reconnectHardware,
    switchToSimulatedMode,
    switchToHardwareMode,
  } = useDevice();

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.round(((totalIntervalSeconds - remainingSeconds) / totalIntervalSeconds) * 100);
  const activeTone = getAudioTone(audioPreference);

  return (
    <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Top Bar: Connection & Ambient Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-calm-border/60 pb-4 mb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300">
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
              Arduino Desk Hub
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                ESP32-S3 / Uno R4
              </span>
            </h3>

            {/* Smart Connection Status: Physical vs Simulated */}
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-400 animate-pulse'
                      : connectionStatus === 'simulated'
                      ? 'bg-sky-400'
                      : 'bg-red-400'
                  }`}
                />
                <span className="text-slate-300 font-semibold capitalize">
                  {connectionStatus === 'connected'
                    ? 'USB Paired'
                    : connectionStatus === 'simulated'
                    ? 'Simulated Mode'
                    : 'Disconnected'}
                </span>
              </span>

              {/* Contextual actions instead of random cycling */}
              {connectionStatus === 'simulated' ? (
                <button
                  onClick={async () => {
                    switchToHardwareMode();
                    await connectHardware();
                  }}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-sans"
                >
                  <Usb className="w-3 h-3" />
                  <span>Connect Hardware</span>
                </button>
              ) : connectionStatus === 'connected' ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">
                    ({connectedPortName || 'COM Port'})
                  </span>
                  <button
                    onClick={disconnectHardware}
                    className="text-[10px] text-red-400 hover:text-red-300 hover:underline font-sans ml-1"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={connectHardware}
                    disabled={isConnecting}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline font-sans"
                  >
                    {isConnecting ? 'Connecting...' : 'Reconnect USB'}
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={switchToSimulatedMode}
                    className="text-[10px] text-sky-400 hover:text-sky-300 hover:underline font-sans"
                  >
                    Run Simulated
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mode Pill */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
              !devicePoweredOn
                ? 'bg-slate-800/80 text-slate-400 border-slate-700'
                : currentMode === 'ALERT'
                ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-red-alert shadow-lg shadow-red-500/20'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                !devicePoweredOn
                  ? 'bg-slate-500'
                  : currentMode === 'ALERT'
                  ? 'bg-red-500 animate-ping'
                  : 'bg-emerald-400 animate-pulse'
              }`}
            />
            {devicePoweredOn ? `${currentMode} ACTIVE` : 'POWER OFF'}
          </span>
        </div>
      </div>

      {/* Main Device Chassis Simulation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center my-2">
        {/* Physical LED Ring Indicator (5 Cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Ambient Backlight Glow */}
            <div
              className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
                !devicePoweredOn
                  ? 'opacity-0'
                  : currentMode === 'ALERT'
                  ? 'bg-red-500/30 animate-pulse'
                  : 'bg-emerald-500/25'
              }`}
            />

            {/* Circular NeoPixel Ring Simulation (12 LED Nodes) */}
            <div className="absolute inset-0 rounded-full border-2 border-slate-800 flex items-center justify-center">
              {[...Array(12)].map((_, idx) => {
                const angle = (idx / 12) * 360;
                const isLit = devicePoweredOn && idx <= Math.floor((progressPercent / 100) * 12);
                return (
                  <span
                    key={idx}
                    style={{
                      transform: `rotate(${angle}deg) translate(0, -60px) rotate(-${angle}deg)`,
                    }}
                    className={`absolute w-3 h-3 rounded-full transition-all duration-300 ${
                      !devicePoweredOn
                        ? 'bg-slate-800'
                        : currentMode === 'ALERT'
                        ? 'bg-red-500 shadow-lg shadow-red-500 animate-ping'
                        : isLit
                        ? 'bg-emerald-400 shadow-md shadow-emerald-400'
                        : 'bg-emerald-950 border border-emerald-800/40'
                    }`}
                  />
                );
              })}
            </div>

            {/* Central Physical Countdown Display */}
            <div className="text-center z-10 flex flex-col items-center">
              <span className="text-2xl font-mono font-bold tracking-tight text-slate-100">
                {devicePoweredOn ? timeFormatted : '--:--'}
              </span>
              <span className="text-[10px] font-mono uppercase text-slate-400">
                {currentMode === 'ALERT' ? 'BREAK OVERDUE' : 'SITTING TIMER'}
              </span>
            </div>
          </div>

          <p className="text-[11px] font-mono text-slate-400 mt-2 text-center">
            {currentMode === 'ALERT' ? (
              <span className="text-red-400 font-semibold">🔴 Chromatic Strobe Active</span>
            ) : (
              <span className="text-emerald-400 font-medium">🟢 Calm Green Constant Pulse</span>
            )}
          </p>
        </div>

        {/* OLED Ticker Display & Audio Status (7 Cols) */}
        <div className="md:col-span-7 flex flex-col justify-between h-full space-y-4">
          {/* Simulated SSD1306 0.96" OLED Display */}
          <div className="rounded-xl border border-sky-900/60 bg-slate-950 p-3 shadow-inner relative overflow-hidden font-mono">
            <div className="flex items-center justify-between text-[10px] text-sky-400/80 border-b border-sky-900/40 pb-1.5 mb-2">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                SSD1306 128x64 OLED
              </span>
              <span>I2C 0x3C</span>
            </div>

            {/* OLED Ticker Content */}
            <div className="h-14 flex flex-col justify-center text-sky-300">
              <p className="text-xs uppercase tracking-wider font-semibold truncate animate-marquee">
                {tickerText}
              </p>
              <div className="flex items-center justify-between text-[11px] text-sky-400/70 mt-1.5">
                <span>MODE: {currentMode}</span>
                <span>
                  {minutes}m {seconds}s REMAINING
                </span>
              </div>
            </div>
          </div>

          {/* Alert Latency & Sound Audio Bar */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[11px] font-mono text-slate-400 flex-shrink-0">Tone:</span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded truncate ${
                  soundEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
                title={activeTone.name}
              >
                {soundEnabled ? activeTone.name.split('(')[0].trim() : 'Muted'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={playFanfarePreview}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono transition-all flex items-center gap-1"
                title="Preview Tone"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                <span>Test Audio</span>
              </button>
              {activeNoteIndex !== null && (
                <button
                  onClick={stopAudio}
                  className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-[10px] font-mono"
                >
                  <Square className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Response Latency Metric if recently recorded */}
          {lastResponseLatencySec !== null && (
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Last Alert Response Latency:
              </span>
              <span className="font-mono font-semibold text-emerald-300">
                {lastResponseLatencySec} seconds
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Level 1: Dedicated Quick Actions Bar */}
      <div className="mt-4 pt-4 border-t border-calm-border/60">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300">
            Quick Actions
          </span>
          <span className="text-[10px] text-slate-500">1-Click Remote & Physical Emulation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Quick Action 1: Snooze Hub 5m */}
          <button
            onClick={() => snoozeHub(5)}
            disabled={!devicePoweredOn}
            className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/40 text-slate-200 text-xs font-medium flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40"
            title="Postpone sitting alert by 5 minutes"
          >
            <AlarmClockOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="text-left">
              <span className="block font-semibold text-slate-200 text-xs">Snooze Hub</span>
              <span className="block text-[10px] text-slate-400 font-mono">+5 Minutes</span>
            </div>
          </button>

          {/* Quick Action 2: Start Guided Microbreak */}
          <Link
            href="/microbreaks"
            className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-2 transition-all active:scale-95"
            title="Launch 2-minute evidence-based movement break"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="text-left">
              <span className="block font-semibold text-emerald-300 text-xs">Start Microbreak</span>
              <span className="block text-[10px] text-emerald-400/80 font-mono">2-Min Guided</span>
            </div>
          </Link>

          {/* Quick Action 3: Mute / Unmute Audio */}
          <button
            onClick={() => simulateIrCommand('IR_CMD_MUTE')}
            disabled={!devicePoweredOn}
            className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 ${
              soundEnabled
                ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80 text-slate-200'
                : 'bg-red-500/15 border-red-500/40 text-red-300'
            }`}
            title="Toggle buzzer audio"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <div className="text-left">
              <span className="block font-semibold text-xs">
                {soundEnabled ? 'Mute Hub' : 'Unmute Hub'}
              </span>
              <span className="block text-[10px] text-slate-400 font-mono">
                {soundEnabled ? 'Piezo Active' : 'Silent Mode'}
              </span>
            </div>
          </button>

          {/* Quick Action 4: Reset Sitting Timer */}
          <button
            onClick={() => simulateIrCommand('IR_CMD_RESET')}
            disabled={!devicePoweredOn}
            className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 text-slate-200 text-xs font-medium flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40"
            title="Reset timer to full interval (IR_CMD_RESET)"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="text-left">
              <span className="block font-semibold text-slate-200 text-xs">Reset Timer</span>
              <span className="block text-[10px] text-slate-400 font-mono">
                {totalIntervalSeconds / 60}m Interval
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
