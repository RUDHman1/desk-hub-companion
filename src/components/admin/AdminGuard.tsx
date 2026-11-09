'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldAlert,
  Lock,
  Sparkles,
  LayoutDashboard,
  Building2,
  Server,
  Trophy,
  Download,
} from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAdmin, switchUser, allProfiles } = useAuth();
  const pathname = usePathname();

  // If user is not admin, show restricted access gate with 1-click role switcher
  if (!isAdmin) {
    const adminAccount = allProfiles.find((p) => p.role === 'admin') || allProfiles[1];

    return (
      <div className="min-h-[70vh] flex items-center justify-center py-10">
        <div className="bg-calm-surface border border-calm-border max-w-lg w-full p-8 rounded-2xl shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-5">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-100">Restricted Admin / HR Portal</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Access to Organizational Sedentary Indices, Hardware Fleet Diagnostics, and Company-wide
            Telemetry Exports is restricted to accounts with the{' '}
            <code className="text-purple-400 font-mono font-bold">admin</code> role (e.g. Wellness
            Directors and Ergonomics Researchers).
          </p>

          <div className="my-6 p-4 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs font-mono">
            <p className="text-slate-400 uppercase text-[10px] mb-1">Current User Context:</p>
            <p className="text-slate-200">
              {user.display_name} • Role:{' '}
              <span className="text-red-400 uppercase font-bold">{user.role}</span>
            </p>
            <p className="text-slate-500 text-[11px] mt-1">
              Department: {user.department || 'General'}
            </p>
          </div>

          {adminAccount && (
            <button
              onClick={() => switchUser(adminAccount.id)}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/25 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Switch to Admin: {adminAccount.display_name}</span>
            </button>
          )}

          <div className="mt-4">
            <Link
              href="/dashboard"
              className="text-xs text-slate-400 hover:text-slate-200 underline font-mono"
            >
              Return to WFH Employee Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Sub-Navigation Tabs
  const adminSubTabs = [
    { href: '/admin', label: '1. Organizational Overview', icon: LayoutDashboard },
    { href: '/admin/analytics', label: '2. Team Analytics', icon: Building2 },
    { href: '/admin/fleet', label: '3. Hardware Fleet', icon: Server },
    { href: '/admin/challenges', label: '4. Challenge Manager', icon: Trophy },
    { href: '/admin/export', label: '5. Data Export Center', icon: Download },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Portal Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-calm-surface to-slate-950 border border-purple-500/25 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                HR & Wellness Manager Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">• Restricted Access</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1.5 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-purple-400" />
              Occupational Health & Hardware Oversight
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Monitor workforce sedentary risk, hardware fleet health, alert latency distributions,
              and export GDPR-compliant telemetry spreadsheets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/export"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Telemetry (.xlsx)</span>
            </Link>
          </div>
        </div>

        {/* Sub-Navigation Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-4 border-t border-purple-500/15">
          {adminSubTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.href === '/admin' ? pathname === '/admin' : pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-purple-500/25 text-purple-200 border-purple-500/50 shadow-xs font-semibold'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
}
