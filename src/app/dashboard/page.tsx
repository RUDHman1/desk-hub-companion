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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-calm-surface via-calm-card/90 to-calm-surface border border-calm-border px-6 py-4.5 sm:py-5 rounded-2xl shadow-lg">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Good afternoon, {user.display_name}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Cornell Protocol Synchronized
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Ambient physical monitor is active. Desk Hub uses non-intrusive chromatic cues to
            prevent deep sitting fatigue while preserving flow state.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Live Hardware Widget (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <LiveHardwareWidget />
        </div>

        {/* Right Column: Quick Status & Health Impact (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Card 1: Lipase & Cardiovascular State */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5 font-medium">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                Vascular & Metabolic Status
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                ACTIVE MITIGATION
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-300">Endothelial Shear Stress</span>
                <span className="font-mono text-emerald-400 font-semibold">Optimal (+18%)</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-300">Postprandial Glucose Clearance</span>
                <span className="font-mono text-emerald-400 font-semibold">+34% attenuation</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-300">Cervical Spine Compressive Load</span>
                <span className="font-mono text-sky-400 font-semibold">-22% decompressed</span>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Microbreak Protocols */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-slate-400 font-medium">
                  Quick Microbreak Launch
                </span>
                <Link
                  href="/microbreaks"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 font-medium transition-colors"
                >
                  All 5 Protocols <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2">
                {quickProtocols.map((p) => (
                  <div
                    key={p.id}
                    className="px-3 py-2.5 rounded-xl bg-calm-card/70 hover:bg-calm-card border border-calm-border hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-200 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {p.durationSeconds}s • {p.difficulty}
                      </p>
                    </div>
                    <button
                      onClick={() => triggerBreakComplete(p.name, p.durationSeconds)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 transition-all text-xs font-mono flex items-center gap-1.5 font-medium shrink-0 active:scale-95"
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
    </div>
  );
}
