'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDevice } from '@/context/DeviceContext';
import { dbStore } from '@/lib/supabase/client';
import { DailyAnalytics, DeviceTelemetry } from '@/types/database';
import { LiveHardwareWidget } from '@/components/dashboard/LiveHardwareWidget';
import { SedentaryTimeLoop } from '@/components/dashboard/SedentaryTimeLoop';
import { MICROBREAK_PROTOCOLS } from '@/lib/protocols';
import {
  Activity,
  HeartPulse,
  Flame,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Play,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    currentMode,
    currentSedentaryZone,
    remainingSeconds,
    totalIntervalSeconds,
    triggerBreakComplete,
  } = useDevice();

  const [analytics, setAnalytics] = useState<DailyAnalytics | null>(null);
  const [recentTelemetry, setRecentTelemetry] = useState<DeviceTelemetry[]>([]);

  const loadData = () => {
    const daily = dbStore.getAnalytics(user.id);
    if (daily.length > 0) {
      setAnalytics(daily[0]);
    }
    const telem = dbStore.getTelemetry(user.id);
    setRecentTelemetry(telem.slice(0, 5));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const quickProtocols = MICROBREAK_PROTOCOLS.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-calm-surface via-calm-card to-calm-surface border border-calm-border p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Good afternoon, {user.display_name}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Cornell Protocol Synchronized
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Ambient physical monitor is active. Desk Hub uses non-intrusive chromatic cues to
            prevent deep sitting fatigue while preserving flow state.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/microbreaks"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Movement Protocol</span>
          </Link>
        </div>
      </div>

      {/* Grid: Live Hardware Widget & Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Hardware Widget (7 Cols) */}
        <div className="lg:col-span-7">
          <LiveHardwareWidget />
        </div>

        {/* Right Column: Quick Status & Health Impact (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* Card 1: Lipase & Cardiovascular State */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                Vascular & Metabolic Status
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ACTIVE MITIGATION
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Endothelial Shear Stress</span>
                <span className="font-mono text-emerald-400 font-medium">Optimal (+18%)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Postprandial Glucose Clearance</span>
                <span className="font-mono text-emerald-400 font-medium">+34% attenuation</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Cervical Spine Compressive Load</span>
                <span className="font-mono text-sky-400 font-medium">-22% decompressed</span>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Microbreak Protocols */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-5 flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400">
                Quick Microbreak Launch
              </span>
              <Link
                href="/microbreaks"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
              >
                All 5 Protocols <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {quickProtocols.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-calm-card/80 hover:bg-calm-card border border-calm-border hover:border-slate-700 transition-all flex items-center justify-between"
                >
                  <div className="max-w-[210px]">
                    <p className="text-xs font-medium text-slate-200 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {p.durationSeconds}s • {p.difficulty}
                    </p>
                  </div>
                  <button
                    onClick={() => triggerBreakComplete(p.name, p.durationSeconds)}
                    className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 transition-all text-xs font-mono flex items-center gap-1"
                    title="Log and complete this break now"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sedentary Time Loop Section */}
      {analytics && (
        <SedentaryTimeLoop
          analytics={analytics}
          currentSedentaryZone={currentSedentaryZone}
          remainingSeconds={remainingSeconds}
          totalIntervalSeconds={totalIntervalSeconds}
        />
      )}

      {/* Recent Telemetry Stream */}
      <div className="bg-calm-surface border border-calm-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Live Hardware Event & Telemetry Stream
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Signals transmitted between your physical Arduino Desk Hub and cloud companion
            </p>
          </div>
          <Link
            href="/admin"
            className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Full Researcher Telemetry Logs →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-calm-border text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Trigger Source</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Hardware Power</th>
                <th className="py-2.5 px-3 text-right">Elapsed Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-calm-border/40">
              {recentTelemetry.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-300">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {t.trigger_source}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        t.current_mode === 'ALERT'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : t.current_mode === 'FOCUS'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.current_mode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        t.device_powered_on ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                    />
                    {t.device_powered_on ? 'ON' : 'OFF'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {Math.floor(t.session_duration_seconds / 60)}m {t.session_duration_seconds % 60}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
