'use client';

import React from 'react';
import { DailyAnalytics } from '@/types/database';
import { AlertTriangle, CheckCircle2, Flame, ShieldAlert, Sparkles, TrendingUp, Clock } from 'lucide-react';

interface SedentaryTimeLoopProps {
  analytics: DailyAnalytics;
  currentSedentaryZone: 'green' | 'yellow' | 'red';
  remainingSeconds: number;
  totalIntervalSeconds: number;
}

export function SedentaryTimeLoop({
  analytics,
  currentSedentaryZone,
  remainingSeconds,
  totalIntervalSeconds,
}: SedentaryTimeLoopProps) {
  const greenMin = analytics?.green_zone_duration_min || 0;
  const yellowMin = analytics?.yellow_zone_duration_min || 0;
  const redMin = analytics?.red_zone_duration_min || 0;
  const standingMin = analytics?.standing_accumulation_min || 0;
  const totalTrackedMin = Math.max(greenMin + yellowMin + redMin, 1);

  // Standing target is 120-240 minutes (2-4 hours per day)
  const standingTargetMin = 180;
  const standingProgressPct = Math.min(Math.round((standingMin / standingTargetMin) * 100), 100);

  // Time loop percentages
  const greenPct = Math.round((greenMin / totalTrackedMin) * 100);
  const yellowPct = Math.round((yellowMin / totalTrackedMin) * 100);
  const redPct = Math.max(100 - greenPct - yellowPct, 0);

  // Sedentary danger assessment
  const lplStatus =
    currentSedentaryZone === 'red'
      ? { label: 'Suppressed (-90%)', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' }
      : currentSedentaryZone === 'yellow'
      ? { label: 'Normal Baseline', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' }
      : { label: 'Peak Synthesis (+38%)', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };

  // SVG Progress Ring calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (standingProgressPct / 100) * circumference;

  return (
    <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient gradient based on active zone */}
      <div
        className={`absolute -right-24 -top-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
          currentSedentaryZone === 'red'
            ? 'bg-red-500/15'
            : currentSedentaryZone === 'yellow'
            ? 'bg-amber-500/15'
            : 'bg-emerald-500/15'
        }`}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
              The Sedentary Time Loop & Progress Ring
            </h2>
            <span
              className={`text-xs font-mono uppercase px-2 py-0.5 rounded-full border ${
                currentSedentaryZone === 'green'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : currentSedentaryZone === 'yellow'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse'
              }`}
            >
              Current: {currentSedentaryZone.toUpperCase()} ZONE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time circadian loop tracking active movement vs. continuous unbroken sedentary bouts
          </p>
        </div>

        {/* LPL Enzyme Metabolic Indicator */}
        <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2.5 ${lplStatus.bg}`}>
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400">
              Skeletal LPL Activity
            </span>
            <span className={`text-xs font-semibold ${lplStatus.color}`}>
              {lplStatus.label}
            </span>
          </div>
          <Flame className={`w-4 h-4 ${lplStatus.color}`} />
        </div>
      </div>

      {/* Grid: Circular Progress Ring & Horizontal Segmented Loop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-6">
        {/* Circular Progress Ring (4 cols) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg viewBox="0 0 128 128" className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="text-slate-800"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="text-emerald-400 transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-slate-100">
                {standingProgressPct}%
              </span>
              <span className="text-[9px] font-mono uppercase text-slate-400">
                DAILY GOAL
              </span>
            </div>
          </div>
          <p className="text-[11px] font-mono text-slate-300 mt-2 text-center">
            <span className="text-emerald-400 font-semibold">{standingMin}m</span> of 180m target
          </p>
        </div>

        {/* Horizontal Segmented Loop (8 cols) */}
        <div className="md:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TODAY'S SEDENTARY COMPOSITION</span>
            <span>Total Logged: {(totalTrackedMin / 60).toFixed(1)} hrs</span>
          </div>

          {/* Continuous Bar Loop */}
          <div className="w-full h-6 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-calm-border flex shadow-inner">
            <div
              style={{ width: `${greenPct}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full transition-all duration-500 relative group cursor-pointer"
              title={`Green Zone (Active): ${greenMin}m (${greenPct}%)`}
            />
            <div
              style={{ width: `${yellowPct}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 relative group cursor-pointer"
              title={`Yellow Zone (Short Sits): ${yellowMin}m (${yellowPct}%)`}
            />
            <div
              style={{ width: `${redPct}%` }}
              className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-r-full transition-all duration-500 relative group cursor-pointer"
              title={`Red Zone (Prolonged Sitting >60m): ${redMin}m (${redPct}%)`}
            />
          </div>

          {/* Zone Breakdown Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Green Zone
              </div>
              <p className="text-lg font-mono font-bold text-slate-100">{greenMin}m</p>
              <p className="text-[10px] text-slate-400">Active movement & breaks</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Yellow Zone
              </div>
              <p className="text-lg font-mono font-bold text-slate-100">{yellowMin}m</p>
              <p className="text-[10px] text-slate-400">Short sitting bouts (&lt;60m)</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Red Zone
              </div>
              <p className="text-lg font-mono font-bold text-slate-100">{redMin}m</p>
              <p className="text-[10px] text-slate-400">Prolonged bouts (&gt;60m)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scientific Rationale Footnote */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">The 20-8-2 Golden Posture Rule:</strong> For every 30
          minutes of office desk time, the scientifically recommended posture rhythm is{' '}
          <span className="text-amber-300 font-medium">20 minutes sitting</span>,{' '}
          <span className="text-emerald-300 font-medium">8 minutes standing</span>, and{' '}
          <span className="text-emerald-300 font-medium">2 minutes active moving/stretching</span>.
        </p>
      </div>
    </div>
  );
}
