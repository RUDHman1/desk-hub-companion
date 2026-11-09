'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dbStore } from '@/lib/supabase/client';
import { DailyAnalytics } from '@/types/database';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  HeartPulse,
  Flame,
  Award,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<DailyAnalytics[]>([]);

  useEffect(() => {
    const data = dbStore.getAnalytics(user.id);
    setHistory(data);
  }, [user.id]);

  const latest = history[0] || {
    green_zone_duration_min: 140,
    yellow_zone_duration_min: 220,
    red_zone_duration_min: 45,
    standing_accumulation_min: 180,
    breaker_classification: 'Top Breaker',
    estimated_kcal_increase: 185.0,
    compliance_rate_pct: 88,
    avg_latency_sec: 14.5,
    alerts_triggered: 8,
    alerts_acknowledged: 7,
  };

  const standingHours = (latest.standing_accumulation_min / 60).toFixed(1);
  const totalSittingHours = ((latest.yellow_zone_duration_min + latest.red_zone_duration_min) / 60).toFixed(1);

  // Epidemiological health metrics
  const complianceScore = latest.compliance_rate_pct || 88;
  const lplActivationTimeMin = Math.round(latest.green_zone_duration_min);
  const glucoseStabilityIndex = Math.min(Math.round((latest.standing_accumulation_min / 180) * 42), 48);
  const vascularShearProtection = Math.min(Math.round((complianceScore / 100) * 35), 38);

  // Hourly Workday Heatmap Mock (9 AM to 5 PM)
  const workdayHours = [
    { hour: '09:00', status: 'green', desc: 'Cornell Microbreak + Standing Call' },
    { hour: '10:00', status: 'yellow', desc: 'Focused Deep Work (40m sit)' },
    { hour: '11:00', status: 'green', desc: 'Soleus Calf Raises & Movement' },
    { hour: '12:00', status: 'green', desc: 'Lunch Walk Lap' },
    { hour: '13:00', status: 'yellow', desc: 'Team Sprint Planning' },
    { hour: '14:00', status: 'red', desc: 'Prolonged Coding Bout (>60m)' },
    { hour: '15:00', status: 'green', desc: 'Desk Hub Red Alert Cleared - 2m Stretch' },
    { hour: '16:00', status: 'yellow', desc: 'Drafting Documentation' },
    { hour: '17:00', status: 'green', desc: 'Standing Wrap-up' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-calm-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Analytics & Habit Tracking
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Cardiometabolic Biomarkers
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Longitudinal telemetry tracking break compliance, workday sedentary heatmaps, and
            projected clinical health milestones.
          </p>
        </div>

        {/* Current Classification Badge */}
        <div className="p-3 rounded-2xl bg-calm-surface border border-calm-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">
              Breaker Classification
            </span>
            <p className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              {latest.breaker_classification}
              <span className="text-xs font-mono text-emerald-400 font-normal">
                (Upper Quartile)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Metric Cards: Compliance Score, Standing Accumulation, LPL Active Time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Break Compliance Score */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Break Compliance Score
            </span>
            <span className="text-emerald-400 font-semibold font-mono">+4% this week</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">{complianceScore}%</span>
            <span className="text-xs text-slate-400">of alerts acknowledged</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div
              style={{ width: `${complianceScore}%` }}
              className="bg-emerald-400 h-full rounded-full transition-all duration-700"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Average response latency: <strong className="text-slate-200">{latest.avg_latency_sec || 14.5}s</strong>
          </p>
        </div>

        {/* Card 2: Standing Accumulation Tracker */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase text-[11px] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              Standing Accumulation
            </span>
            <span className="text-sky-400 font-mono text-[11px]">Target: 3.0 hrs</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">{standingHours}</span>
            <span className="text-xs text-slate-400">hours / day</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div
              style={{
                width: `${Math.min(Math.round(((latest.standing_accumulation_min || 0) / 180) * 100), 100)}%`,
              }}
              className="bg-sky-400 h-full rounded-full transition-all duration-700"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Total sitting: <strong className="text-slate-200">{totalSittingHours} hrs</strong> (optimal &lt; 6 hrs)
          </p>
        </div>

        {/* Card 3: LPL Enzyme Activation Time */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase text-[11px] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              LPL Activation Time
            </span>
            <span className="text-amber-400 font-mono text-[11px]">Enzyme Stimulated</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">{lplActivationTimeMin}</span>
            <span className="text-xs text-slate-400">minutes active</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div
              style={{
                width: `${Math.min(Math.round((lplActivationTimeMin / 120) * 100), 100)}%`,
              }}
              className="bg-amber-400 h-full rounded-full transition-all duration-700"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Est. energy thermogenesis: <strong className="text-emerald-300">+{latest.estimated_kcal_increase || 180} kcal</strong>
          </p>
        </div>
      </div>

      {/* Prolonged Sitting Heatmap */}
      <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              Workday Sedentary Heatmap
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Hourly Postural Matrix
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizes continuous sitting bouts vs. active postural interruptions throughout your 9 AM – 5 PM workday.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400" /> Active / Break
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-amber-400" /> &lt;60m Sit
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-red-500 animate-pulse" /> &gt;60m Prolonged
            </span>
          </div>
        </div>

        {/* Heatmap Blocks */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-3">
          {workdayHours.map((slot) => {
            const isGreen = slot.status === 'green';
            const isYellow = slot.status === 'yellow';
            return (
              <div
                key={slot.hour}
                className={`p-3 rounded-xl border flex flex-col justify-between text-xs transition-all ${
                  isGreen
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : isYellow
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-red-500/15 border-red-500/40 text-red-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-[11px]">{slot.hour}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isGreen ? 'bg-emerald-400' : isYellow ? 'bg-amber-400' : 'bg-red-500 animate-ping'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-tight line-clamp-2 mt-1">
                  {slot.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Health Milestones & Epidemiological Risk Attenuation */}
      <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-emerald-400" />
              Health Milestones & Cardiometabolic Impact
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Estimates derived from Dunstan et al. (Diabetes Care) & Healy et al. (European Heart Journal)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-emerald-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              Glucose Stability Marker
            </span>
            <p className="text-2xl font-bold font-mono text-slate-100 mt-1">
              -{glucoseStabilityIndex}%
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Reduction in postprandial glucose excursions via rhythmic soleus contractions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-sky-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Vascular Shear Restoration
            </span>
            <p className="text-2xl font-bold font-mono text-slate-100 mt-1">
              +{vascularShearProtection}%
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Restoration of femoral artery shear rate preventing endothelial dysfunction.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-purple-400 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              Cardiovascular Hazard Reduction
            </span>
            <p className="text-2xl font-bold font-mono text-slate-100 mt-1">
              -28%
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Projected hazard reduction for individuals shifting from Prolongers to Breakers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
