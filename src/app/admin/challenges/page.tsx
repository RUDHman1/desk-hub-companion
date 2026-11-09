'use client';

import React, { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { dbStore } from '@/lib/supabase/client';
import { Challenge, WellnessBulletin, AnonymizedFeedback } from '@/types/database';
import {
  Trophy,
  Plus,
  BookOpen,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Calendar,
  Users,
  Eye,
  Megaphone,
} from 'lucide-react';

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [bulletins, setBulletins] = useState<WellnessBulletin[]>([]);
  const [feedback, setFeedback] = useState<AnonymizedFeedback[]>([]);

  // Challenge Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newGoal, setNewGoal] = useState(30);
  const [newDept, setNewDept] = useState('Company-Wide');

  const loadData = () => {
    setChallenges(dbStore.getChallenges());
    setBulletins(dbStore.getBulletins());
    setFeedback(dbStore.getFeedback());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    dbStore.createChallenge({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Complete daily postural movement routines to prevent deep fatigue.',
      department: newDept,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      target_metric_type: 'break_count',
      target_goal_value: Number(newGoal) || 30,
    });

    setNewTitle('');
    setNewDesc('');
    setShowCreateModal(false);
    loadData();
  };

  return (
    <AdminGuard>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-calm-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              Wellness Programs & Challenge Manager
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Launch corporate movement sprints, broadcast educational ergonomic digests, and monitor employee suggestions.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Launch New Challenge</span>
          </button>
        </div>

        {/* Section 1: Active Corporate Challenges */}
        <div>
          <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Active Workforce Challenges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {challenges.map((c) => (
              <div
                key={c.id}
                className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25">
                      {c.department || 'Company-Wide'}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      {c.participants_count || 12} Enrolled
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{c.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Goal: {c.target_goal_value} breaks</span>
                  <span className="text-emerald-400">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Educational Infographics & Bulletins */}
        <div>
          <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-sky-400" />
            Broadcast Educational Infographics & Clinical Bulletins
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bulletins.map((b) => (
              <div
                key={b.id}
                className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      {b.category}
                    </span>
                    <span className="text-slate-500 text-[10px] font-mono flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {b.views_count} Reads
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 leading-snug">{b.title}</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{b.summary}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">{b.posted_date}</span>
                  <span className="text-xs text-sky-400 font-medium">{b.action_label || 'Read Digest'} →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Anonymized Employee Feedback Box */}
        <div>
          <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Anonymized Employee Ergonomics Feedback
          </h3>
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-5 shadow-xl space-y-3">
            {feedback.map((fb) => (
              <div
                key={fb.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {fb.department}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase font-semibold ${
                        fb.sentiment === 'positive'
                          ? 'text-emerald-400'
                          : fb.sentiment === 'urgent'
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {fb.sentiment}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans">{fb.feedback_text}</p>
                </div>

                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 whitespace-nowrap self-start sm:self-center border border-slate-700">
                  Status: {fb.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Create Challenge */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-calm-surface border border-calm-border max-w-md w-full rounded-2xl shadow-2xl p-6">
              <h3 className="text-base font-bold text-slate-100 mb-4">Launch Workplace Movement Sprint</h3>
              <form onSubmit={handleCreateChallenge} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-mono text-[11px]">Challenge Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 100 Cornell Breaks in November"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono text-[11px]">Department Scope</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-purple-500"
                  >
                    <option value="Company-Wide">Company-Wide</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Data & Analytics">Data & Analytics</option>
                    <option value="Customer Operations">Customer Operations</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono text-[11px]">Target Goal Value</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={newGoal}
                    onChange={(e) => setNewGoal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono text-[11px]">Description</label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Encourage peer-led breaks to break up unbroken sedentary postures."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    Launch Challenge
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
