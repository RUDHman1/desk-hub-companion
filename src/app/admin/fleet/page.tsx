'use client';

import React, { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { dbStore } from '@/lib/supabase/client';
import { FleetDevice } from '@/types/database';
import {
  Server,
  Wifi,
  Battery,
  BatteryCharging,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Cpu,
  Zap,
} from 'lucide-react';

export default function AdminFleetPage() {
  const [fleet, setFleet] = useState<FleetDevice[]>([]);
  const [rebootingId, setRebootingId] = useState<string | null>(null);
  const [rebootNotice, setRebootNotice] = useState<string | null>(null);

  const loadFleet = () => {
    setFleet(dbStore.getFleetDevices());
  };

  useEffect(() => {
    loadFleet();
  }, []);

  const handleReboot = (deviceId: string, mac: string) => {
    setRebootingId(deviceId);
    setTimeout(() => {
      dbStore.rebootFleetDevice(deviceId);
      loadFleet();
      setRebootingId(null);
      setRebootNotice(`Successfully dispatched soft reboot & heartbeat ping to device [${mac}]`);
      setTimeout(() => setRebootNotice(null), 4000);
    }, 1200);
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-calm-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              Hardware Fleet Diagnostics & Registry
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live IoT registry of physical ESP32-S3 and Arduino Uno WiFi R4 hubs deployed across WFH workstations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
              {fleet.filter((f) => f.connection_status === 'online').length} of {fleet.length} Hubs Online
            </span>
          </div>
        </div>

        {rebootNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{rebootNotice}</span>
          </div>
        )}

        {/* Hardware Fleet Table */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-calm-border/60 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 font-medium">DEVICE / MAC</th>
                  <th className="pb-3 font-medium">ASSIGNED USER</th>
                  <th className="pb-3 font-medium">DEPARTMENT</th>
                  <th className="pb-3 font-medium">FIRMWARE</th>
                  <th className="pb-3 font-medium">POWER / BATTERY</th>
                  <th className="pb-3 font-medium">STATUS</th>
                  <th className="pb-3 font-medium text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {fleet.map((device) => {
                  const isOnline = device.connection_status === 'online';
                  const isStandby = device.connection_status === 'standby';
                  const isRebooting = rebootingId === device.id;

                  return (
                    <tr key={device.id} className="hover:bg-slate-900/40">
                      {/* Device & MAC */}
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="font-bold text-slate-200 block text-xs font-sans">
                              {device.hardware_model}
                            </span>
                            <span className="text-[10px] text-slate-400">{device.mac_address}</span>
                          </div>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3 text-slate-200 font-sans font-medium text-xs">
                        {device.assigned_user_name}
                      </td>

                      {/* Department */}
                      <td className="py-3 text-slate-400">{device.department}</td>

                      {/* Firmware */}
                      <td className="py-3 text-sky-400 font-semibold">{device.firmware_version}</td>

                      {/* Battery / Power */}
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          {device.power_source === 'USB-C Line' ? (
                            <BatteryCharging className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Battery className="w-4 h-4 text-amber-400" />
                          )}
                          <span className="text-slate-200">{device.battery_level_pct}%</span>
                          <span className="text-[10px] text-slate-500">({device.power_source})</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isOnline
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : isStandby
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {device.connection_status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleReboot(device.id, device.mac_address)}
                          disabled={isRebooting}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-slate-100 text-[10px] font-mono transition-all flex items-center gap-1 ml-auto border border-slate-700"
                        >
                          <RotateCcw className={`w-3 h-3 ${isRebooting ? 'animate-spin' : ''}`} />
                          <span>{isRebooting ? 'Pinging...' : 'Ping / Reset'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
