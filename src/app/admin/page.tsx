'use client';

import React, { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { dbStore } from '@/lib/supabase/client';
import { DailyAnalytics, DeviceTelemetry, FleetDevice } from '@/types/database';
import {
  Users,
  Activity,
  Server,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Zap,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<DailyAnalytics[]>([]);
  const [fleet, setFleet] = useState<FleetDevice[]>([]);
  const [telemetry, setTelemetry] = useState<DeviceTelemetry[]>([]);

  useEffect(() => {
    setAnalytics(dbStore.getAnalytics(undefined, true));
    setFleet(dbStore.getFleetDevices());
    setTelemetry(dbStore.getTelemetry(undefined, true));
  }, []);

  // 1. Fleet health score (active vs offline hubs)
  const totalHubs = fleet.length;
  const onlineHubs = fleet.filter((f) => f.connection_status === 'online').length;
  const fleetHealthScore = totalHubs > 0 ? Math.round((onlineHubs / totalHubs) * 100) : 0;

  // 2. Company-wide sedentary risk index (% of workforce in "Prolonger" vs "Breaker" quartiles)
  const totalTrackedUsers = analytics.length;
  const breakersCount = analytics.filter(
    (a) => a.breaker_classification === 'Top Breaker' || a.breaker_classification === 'Moderate Breaker'
  ).length;
  const prolongersCount = totalTrackedUsers - breakersCount;
  const breakerQuartilePct = totalTrackedUsers > 0 ? Math.round((breakersCount / totalTrackedUsers) * 100) : 75;
  const prolongerQuartilePct = 100 - breakerQuartilePct;

  // 3. Total active microbreak adoption rate
  const totalMicrobreaksLogged = dbStore.getMicrobreaks(undefined, true).length;
  const avgComplianceRate = Math.round(
    analytics.reduce((acc, curr) => acc + (curr.compliance_rate_pct || 85), 0) /
      Math.max(analytics.length, 1)
  );
  const avgAlertLatency = (
    analytics.reduce((acc, curr) => acc + (curr.avg_latency_sec || 16), 0) /
    Math.max(analytics.length, 1)
  ).toFixed(1);

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Top 4 Organizational Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Fleet Health Score */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono uppercase text-[11px] flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-400" />
                Fleet Health Score
              </span>
              <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                {onlineHubs}/{totalHubs} Online
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-100">{fleetHealthScore}%</span>
              <span className="text-xs text-slate-400">operational</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                style={{ width: `${fleetHealthScore}%` }}
                className="bg-emerald-400 h-full rounded-full"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>ESP32 & Uno Nodes</span>
              <Link href="/admin/fleet" className="text-emerald-400 hover:underline">
                View Fleet →
              </Link>
            </p>
          </div>

          {/* Card 2: Breakers vs Prolongers Index */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono uppercase text-[11px] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-400" />
                Workforce Breaker Ratio
              </span>
              <span className="text-purple-300 font-mono text-[11px] font-semibold">
                Upper Quartile
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-100">{breakerQuartilePct}%</span>
              <span className="text-xs text-slate-400">Active Breakers</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden flex">
              <div style={{ width: `${breakerQuartilePct}%` }} className="bg-purple-400 h-full" />
              <div style={{ width: `${prolongerQuartilePct}%` }} className="bg-red-500 h-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Prolonger Risk Group: <strong className="text-red-400">{prolongerQuartilePct}%</strong>
            </p>
          </div>

          {/* Card 3: Alert Response Latency */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono uppercase text-[11px] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                Alert Response Latency
              </span>
              <span className="text-sky-300 font-mono text-[11px]">Mean Time</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-100">{avgAlertLatency}s</span>
              <span className="text-xs text-slate-400">to clear Red Alert</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
              <div style={{ width: '85%' }} className="bg-sky-400 h-full rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Optimal threshold: &lt; 30 seconds
            </p>
          </div>

          {/* Card 4: Break Compliance Rate */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono uppercase text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Company Compliance
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">Aggregated</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-100">{avgComplianceRate}%</span>
              <span className="text-xs text-slate-400">break adherence</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                style={{ width: `${avgComplianceRate}%` }}
                className="bg-emerald-400 h-full rounded-full"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Total breaks completed: <strong className="text-slate-200">{totalMicrobreaksLogged}</strong>
            </p>
          </div>
        </div>

        {/* Middle Section: Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/admin/analytics"
            className="p-5 rounded-2xl bg-calm-surface border border-calm-border hover:border-purple-500/50 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300">
                Departmental & Team Analytics
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Compare break compliance by engineering, product, and sales teams. Monitor sitting
                fatigue and alert latency distributions.
              </p>
            </div>
            <span className="text-xs text-purple-400 font-medium flex items-center gap-1 mt-4">
              Open Team Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/admin/fleet"
            className="p-5 rounded-2xl bg-calm-surface border border-calm-border hover:border-emerald-500/50 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300">
                Hardware Fleet Registry
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Inspect physical Desk Hub devices, MAC/IP assignments, battery health, and trigger
                remote firmware pings.
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-4">
              Manage Hardware Fleet <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/admin/export"
            className="p-5 rounded-2xl bg-calm-surface border border-calm-border hover:border-sky-500/50 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-sky-300">
                Data Export & Compliance Center
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Download structured Excel (.xlsx) / CSV reports with employee sitting hours, response
                latencies, and GDPR anonymization.
              </p>
            </div>
            <span className="text-xs text-sky-400 font-medium flex items-center gap-1 mt-4">
              Open Export Center <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        {/* Live Hardware Telemetry Stream */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-calm-border/60">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Organization Telemetry Stream
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time event log from paired Desk Hub units across all departments.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Auto-Polling Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 font-medium">TIMESTAMP</th>
                  <th className="pb-3 font-medium">EMPLOYEE</th>
                  <th className="pb-3 font-medium">DEPARTMENT</th>
                  <th className="pb-3 font-medium">TRIGGER / EVENT</th>
                  <th className="pb-3 font-medium">MODE</th>
                  <th className="pb-3 font-medium text-right">LATENCY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono text-[11px]">
                {telemetry.slice(0, 8).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 text-slate-400">
                      {new Date(t.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 font-sans font-medium text-slate-200">{t.user_name}</td>
                    <td className="py-2.5 text-slate-400">{t.department || 'Engineering'}</td>
                    <td className="py-2.5">
                      <span className="text-sky-400 font-semibold">{t.trigger_source}</span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.current_mode === 'ALERT'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {t.current_mode}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-300">
                      {t.alert_response_latency_sec ? `${t.alert_response_latency_sec}s` : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
