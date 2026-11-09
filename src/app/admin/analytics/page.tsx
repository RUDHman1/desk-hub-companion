'use client';

import React, { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { dbStore } from '@/lib/supabase/client';
import { DepartmentMetric, DailyAnalytics } from '@/types/database';
import {
  Building2,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Flame,
  Award,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [departments, setDepartments] = useState<DepartmentMetric[]>([]);
  const [analytics, setAnalytics] = useState<DailyAnalytics[]>([]);

  useEffect(() => {
    setDepartments(dbStore.getDepartmentMetrics());
    setAnalytics(dbStore.getAnalytics(undefined, true));
  }, []);

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-calm-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              Departmental & Team Analytics
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative ergonomic compliance, prolonged sedentary exposure, and alert clearance latency by organizational unit.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            <span>Tracking {departments.length} Business Units</span>
          </div>
        </div>

        {/* Department Comparative Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => {
            const isHighCompliance = dept.avg_compliance_rate_pct >= 85;
            return (
              <div
                key={dept.department}
                className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl hover:border-purple-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {dept.headcount} Team Members
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        isHighCompliance
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {isHighCompliance ? 'Optimal Flow' : 'Sedentary Risk'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100">{dept.department}</h3>

                  <div className="space-y-3 mt-4">
                    {/* Compliance Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-400">Break Compliance</span>
                        <span className="font-bold text-slate-200">
                          {dept.avg_compliance_rate_pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          style={{ width: `${dept.avg_compliance_rate_pct}%` }}
                          className={`h-full rounded-full ${
                            isHighCompliance ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Stats List */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">AVG SITTING / DAY</span>
                        <span className="font-bold text-slate-200 text-sm">
                          {dept.avg_prolonged_sitting_hours} hrs
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">ALERT LATENCY</span>
                        <span className="font-bold text-sky-400 text-sm">
                          {dept.avg_alert_response_sec}s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Breaker Ratio:</span>
                  <span className="text-purple-300 font-semibold">{dept.breaker_ratio}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Latency & Response Tracking Insights */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                Alert Response Latency & Habit Formation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Latency measures the elapsed seconds between the Arduino triggering a Red Alert and the employee initiating a stretch or resetting the hub.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-emerald-400 text-[10px] block uppercase font-bold">
                Rapid Responders (&lt; 15s)
              </span>
              <p className="text-2xl font-bold text-slate-100 mt-1">64%</p>
              <p className="text-slate-400 text-xs font-sans mt-1">
                Employees who immediately stand or trigger a microbreak within 15 seconds of buzzer alert.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-amber-400 text-[10px] block uppercase font-bold">
                Snoozers (15s – 60s)
              </span>
              <p className="text-2xl font-bold text-slate-100 mt-1">26%</p>
              <p className="text-slate-400 text-xs font-sans mt-1">
                Employees concluding a paragraph or wrapping up an active task before acknowledging.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-red-400 text-[10px] block uppercase font-bold">
                Prolonged Delay (&gt; 60s)
              </span>
              <p className="text-2xl font-bold text-slate-100 mt-1">10%</p>
              <p className="text-slate-400 text-xs font-sans mt-1">
                Employees who leave the buzzer sounding or have hub muted during long calls.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
