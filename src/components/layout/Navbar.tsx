'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useDevice } from '@/context/DeviceContext';
import {
  Activity,
  Timer,
  BarChart3,
  Sliders,
  Users,
  ShieldAlert,
  Volume2,
  VolumeX,
  Radio,
  Cpu,
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  Building2,
  Server,
  Trophy,
  Download,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, allProfiles, switchUser, isAdmin } = useAuth();
  const {
    currentMode,
    connectionStatus,
    soundEnabled,
    toggleSound,
    toggleConnection,
    devicePoweredOn,
  } = useDevice();

  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Check if current route is in the Admin HR / Wellness Portal
  const isInAdminPortal = pathname.startsWith('/admin');

  // User Portal Nav Items
  const userNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Activity },
    { href: '/microbreaks', label: 'Microbreak Hub', icon: Timer },
    { href: '/analytics', label: 'Analytics & Habits', icon: BarChart3 },
    { href: '/community', label: 'Challenges', icon: Users },
    { href: '/settings', label: 'Device & Hardware', icon: Sliders },
  ];

  // Admin / HR Portal Nav Items
  const adminNavItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/analytics', label: 'Team Analytics', icon: Building2 },
    { href: '/admin/fleet', label: 'Hardware Fleet', icon: Server },
    { href: '/admin/challenges', label: 'Challenge Manager', icon: Trophy },
    { href: '/admin/export', label: 'Data Export Center', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-50 bg-calm-surface/95 backdrop-blur-md border-b border-calm-border">
      {/* Upper Portal Switcher Ribbon */}
      <div className="bg-slate-950/80 border-b border-calm-border/40 px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-calm-border/60">
            <Link
              href="/dashboard"
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                !isInAdminPortal
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>WFH Employee Portal</span>
            </Link>

            <Link
              href="/admin"
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                isInAdminPortal
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-purple-400" />
              <span>Admin HR & Wellness Manager</span>
              {isAdmin && (
                <span className="text-[9px] bg-purple-500/30 text-purple-200 px-1 rounded font-mono">
                  ROLE: ADMIN
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Live System Status — minimal dot only */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              !devicePoweredOn
                ? 'bg-slate-500'
                : currentMode === 'ALERT'
                ? 'bg-red-400 animate-ping'
                : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span>{devicePoweredOn ? `HUB ${currentMode}` : 'HUB OFF'}</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hardware Status */}
          <div className="flex items-center gap-3">
            <Link
              href={isInAdminPortal ? '/admin' : '/dashboard'}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isInAdminPortal
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                      : !devicePoweredOn
                      ? 'bg-slate-800 text-slate-500'
                      : currentMode === 'ALERT'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-red-alert'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                  }`}
                >
                  {isInAdminPortal ? <Building2 className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                </div>
                {devicePoweredOn && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-calm-surface ${
                      currentMode === 'ALERT'
                        ? 'bg-red-500 animate-ping'
                        : 'bg-emerald-500 animate-pulse'
                    }`}
                  />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
                  <span className="font-semibold text-slate-100 text-sm tracking-tight">
                    {isInAdminPortal ? 'HR & Wellness Hub' : 'Desk Hub Companion'}
                  </span>
                  <span
                    className={`hidden sm:inline text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                      isInAdminPortal
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {isInAdminPortal ? 'Admin' : 'v2.4 IoT'}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {(isInAdminPortal ? adminNavItems : userNavItems).map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? isInAdminPortal
                        ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm font-semibold'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2.5">
            {/* Quick Audio Mute Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Buzzer Sound Active (Click to Mute)' : 'Buzzer Muted (Click to Unmute)'}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-slate-800/80 text-emerald-400 border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-800'
                  : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Hardware Link Status */}
            <button
              onClick={toggleConnection}
              title={`Hardware Link: ${connectionStatus}`}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15'
                  : connectionStatus === 'simulated'
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/15'
                  : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/15'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden xl:inline capitalize text-[11px] font-medium">{connectionStatus}</span>
            </button>

            {/* User Profile & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-calm-card/90 border border-calm-border hover:border-slate-600 transition-all text-xs"
              >
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.display_name}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                />
                <span className="hidden sm:inline text-slate-200 max-w-[140px] lg:max-w-[180px] truncate font-medium text-xs">
                  {user.display_name}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                    user.role === 'admin'
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {user.role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-calm-surface border border-calm-border shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-calm-border/60">
                      <p className="text-[10px] font-mono uppercase text-slate-400">
                        Switch Identity / Persona
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Test regular WFH Employee vs. HR / Ergonomics Lead views
                      </p>
                    </div>

                    <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
                      {allProfiles.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            switchUser(p.id);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition-all ${
                            p.id === user.id
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={p.display_name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <p className="font-medium text-slate-200 text-xs truncate max-w-[160px]">
                                {p.display_name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {p.department?.split(' ')[0] || 'General'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                                p.role === 'admin'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {p.role}
                            </span>
                            {p.id === user.id && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Mobile Navigation Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-calm-border text-slate-300 hover:text-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-calm-border/80 bg-slate-950/95 px-4 pt-3 pb-5 space-y-2 backdrop-blur-lg">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 pt-1 pb-1">
            {isInAdminPortal ? 'HR & Wellness Admin Navigation' : 'Employee Portal Navigation'}
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {(isInAdminPortal ? adminNavItems : userNavItems).map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2.5 ${
                    isActive
                      ? isInAdminPortal
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
