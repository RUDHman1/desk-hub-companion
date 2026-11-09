'use client';

import React, { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { dbStore } from '@/lib/supabase/client';
import { ExportTelemetryRow } from '@/types/database';
import * as XLSX from 'xlsx';
import {
  Download,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldCheck,
  Sparkles,
  Table,
  FileText,
} from 'lucide-react';

export default function AdminExportPage() {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [anonymize, setAnonymize] = useState<boolean>(false);
  const [exportData, setExportData] = useState<ExportTelemetryRow[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const loadPreview = () => {
    const data = dbStore.getExportData({
      department: selectedDept,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      anonymize,
    });
    setExportData(data);
  };

  useEffect(() => {
    loadPreview();
  }, [selectedDept, startDate, endDate, anonymize]);

  // Export to Excel (.xlsx) using xlsx library
  const handleExportXLSX = () => {
    setIsExporting(true);

    try {
      // 1. Create worksheet from JSON data with exact column schema
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Auto-fit column widths
      const colWidths = [
        { wch: 16 }, // Employee_ID
        { wch: 28 }, // Department
        { wch: 14 }, // Date
        { wch: 20 }, // Total_Sitting_Hours
        { wch: 28 }, // Unbroken_Bouts_Count (>60m)
        { wch: 18 }, // Alerts_Triggered
        { wch: 20 }, // Alerts_Acknowledged
        { wch: 20 }, // Compliance_Rate_%
        { wch: 24 }, // Avg_Response_Time_Sec
      ];
      worksheet['!cols'] = colWidths;

      // 2. Create Workbook and append worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Occupational Telemetry');

      // Add a second Summary sheet with cohort meta
      const summaryData = [
        { Metric: 'Report Generation Timestamp', Value: new Date().toISOString() },
        { Metric: 'Total Records Exported', Value: exportData.length },
        { Metric: 'Department Filter', Value: selectedDept === 'all' ? 'All Departments' : selectedDept },
        { Metric: 'GDPR Anonymization Applied', Value: anonymize ? 'Yes (Hashed IDs)' : 'No' },
        {
          Metric: 'Mean Break Compliance',
          Value: `${(
            exportData.reduce((acc, r) => acc + r['Compliance_Rate_%'], 0) /
            Math.max(exportData.length, 1)
          ).toFixed(1)}%`,
        },
        {
          Metric: 'Mean Alert Clearance Latency',
          Value: `${(
            exportData.reduce((acc, r) => acc + r.Avg_Response_Time_Sec, 0) /
            Math.max(exportData.length, 1)
          ).toFixed(1)} seconds`,
        },
      ];
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 32 }, { wch: 35 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

      // 3. Trigger Download
      const fileName = `desk_hub_telemetry_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setExportNotice(`Successfully exported ${exportData.length} records to ${fileName}`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err) {
      console.error('Export error:', err);
      setExportNotice('Export failed. Please check browser permissions.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `desk_hub_telemetry_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportNotice(`Exported ${exportData.length} rows to CSV format.`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err) {
      console.error('CSV export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-calm-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-400" />
              Data Export & Compliance Center
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate structured, GDPR-compliant datasets for epidemiological research, wellness audits, and HR reporting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={isExporting || exportData.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={handleExportXLSX}
              disabled={isExporting || exportData.length === 0}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isExporting ? 'Generating...' : 'Download Telemetry (.xlsx)'}</span>
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Filter Controls & GDPR Toggle */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Department Filter */}
          <div>
            <label className="text-slate-400 block mb-1 font-mono text-[11px] flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              Department Scope
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-purple-500"
            >
              <option value="all">All Departments (Global)</option>
              <option value="Engineering (Platform)">Engineering (Platform)</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Product & Design">Product & Design</option>
              <option value="People Operations & Wellness">People Operations & Wellness</option>
              <option value="Data & Analytics">Data & Analytics</option>
              <option value="Customer Operations">Customer Operations</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-slate-400 block mb-1 font-mono text-[11px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-purple-500 font-mono"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-slate-400 block mb-1 font-mono text-[11px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-purple-500 font-mono"
            />
          </div>

          {/* GDPR Anonymization Switch */}
          <div className="flex flex-col justify-end">
            <label
              onClick={() => setAnonymize(!anonymize)}
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                anonymize
                  ? 'bg-purple-500/15 border-purple-500/50 text-purple-200'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold">GDPR Anonymization</span>
              </div>
              <input
                type="checkbox"
                checked={anonymize}
                onChange={() => setAnonymize(!anonymize)}
                className="accent-purple-500"
              />
            </label>
          </div>
        </div>

        {/* Live Export Preview Table */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-calm-border/60">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-400" />
                Spreadsheet Column Preview ({exportData.length} Rows)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact schema formatted for researchers: Employee_ID, Department, Date, Total_Sitting_Hours, Unbroken_Bouts_Count (&gt;60m), Alerts_Triggered, Alerts_Acknowledged, Compliance_Rate_%, Avg_Response_Time_Sec.
              </p>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              xlsx engine v0.18.5
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 font-medium">Employee_ID</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Total_Sitting_Hours</th>
                  <th className="pb-3 font-medium text-right">Unbroken_Bouts (&gt;60m)</th>
                  <th className="pb-3 font-medium text-right">Alerts_Triggered</th>
                  <th className="pb-3 font-medium text-right">Alerts_Acknowledged</th>
                  <th className="pb-3 font-medium text-right">Compliance_Rate_%</th>
                  <th className="pb-3 font-medium text-right">Avg_Response_Time_Sec</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono text-[11px]">
                {exportData.map((row, idx) => (
                  <tr key={`${row.Employee_ID}-${row.Date}-${idx}`} className="hover:bg-slate-900/40">
                    <td className="py-2.5 font-bold text-sky-400">{row.Employee_ID}</td>
                    <td className="py-2.5 text-slate-300 font-sans">{row.Department}</td>
                    <td className="py-2.5 text-slate-400">{row.Date}</td>
                    <td className="py-2.5 text-right font-bold text-slate-200">
                      {row.Total_Sitting_Hours.toFixed(2)}h
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          row['Unbroken_Bouts_Count (>60m)'] > 1
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {row['Unbroken_Bouts_Count (>60m)']}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-300">{row.Alerts_Triggered}</td>
                    <td className="py-2.5 text-right text-emerald-400">{row.Alerts_Acknowledged}</td>
                    <td className="py-2.5 text-right font-bold text-slate-200">
                      {row['Compliance_Rate_%']}%
                    </td>
                    <td className="py-2.5 text-right text-sky-300">{row.Avg_Response_Time_Sec}s</td>
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
