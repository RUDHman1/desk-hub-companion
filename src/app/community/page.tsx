'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dbStore } from '@/lib/supabase/client';
import { Challenge, ChallengeParticipant, SocialChatMessage } from '@/types/database';
import {
  Users,
  Trophy,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  ShieldCheck,
  UserCheck,
  Building2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CommunityPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string>('ch-01');
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [messages, setMessages] = useState<SocialChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  const loadData = () => {
    const chList = dbStore.getChallenges();
    setChallenges(chList);
    setParticipants(dbStore.getParticipants(activeChallengeId));
    setMessages(dbStore.getChat(activeChallengeId));
  };

  useEffect(() => {
    loadData();
  }, [activeChallengeId, user.id]);

  const activeChallenge = challenges.find((c) => c.id === activeChallengeId) || challenges[0];

  const handleJoinOrProgress = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // fallback
    }

    dbStore.joinOrIncrementChallenge(activeChallengeId, user.id, 1);
    setParticipants(dbStore.getParticipants(activeChallengeId));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    dbStore.addChatMessage(user.id, newMessage.trim(), activeChallengeId);
    setNewMessage('');
    setMessages(dbStore.getChat(activeChallengeId));
  };

  const userParticipant = participants.find((p) => p.user_id === user.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-calm-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Gamification & Team Challenges
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Social Ergonomics
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Cultivate a workplace movement culture. Departmental streaks and manager role-modeling
            normalize regular sit-stand postural transitions and collective health goals.
          </p>
        </div>

        {/* User Quick Progress Badge */}
        <div className="p-3 rounded-2xl bg-calm-surface border border-calm-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400">
              Personal Challenge Score
            </span>
            <p className="text-sm font-semibold text-slate-100 font-mono">
              {userParticipant?.current_progress_value || 0} /{' '}
              {activeChallenge?.target_goal_value || 30} Completed
            </p>
          </div>
        </div>
      </div>

      {/* Challenge Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {challenges.map((challenge) => {
          const isSelected = challenge.id === activeChallengeId;
          return (
            <button
              key={challenge.id}
              onClick={() => setActiveChallengeId(challenge.id)}
              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-calm-surface border-emerald-500/50 shadow-xl shadow-emerald-500/5'
                  : 'bg-calm-surface/60 border-calm-border hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {challenge.department || 'Company-Wide'}
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {challenge.participants_count || 12} Joined
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">{challenge.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {challenge.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Goal: {challenge.target_goal_value} units</span>
                <span className="text-emerald-400 font-medium">
                  {isSelected ? 'Active Selection' : 'View Leaderboard'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Challenge Progress & Social Encouragement Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Challenge Detail & Team Leaderboard (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400">
                  Team Leaderboard
                </span>
                <h2 className="text-base font-bold text-slate-100">{activeChallenge?.title}</h2>
              </div>

              <button
                onClick={handleJoinOrProgress}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Log Break Progress</span>
              </button>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-2 mt-4">
              {participants.map((p, idx) => {
                const isUser = p.user_id === user.id;
                const target = activeChallenge?.target_goal_value || 30;
                const progressPct = Math.min(Math.round((p.current_progress_value / target) * 100), 100);

                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isUser
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-slate-900/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-400 w-4 text-center">
                        #{idx + 1}
                      </span>
                      <img
                        src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={p.user_name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                          {p.user_name}
                          {isUser && (
                            <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300">
                              YOU
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {p.department || 'Team Member'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {p.current_progress_value} / {target}
                      </span>
                      <span className="block text-[10px] text-slate-500 font-mono">
                        {progressPct}% achieved
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Social Support & Role Modeling Chat Feed (6 Cols) */}
        <div className="lg:col-span-6">
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-calm-border/60">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Social Support & Role Modeling Feed
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Live Peer Sync</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    msg.is_manager_role_model
                      ? 'bg-purple-500/10 border-purple-500/30'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={msg.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={msg.user_name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-200 text-xs">{msg.user_name}</span>
                      {msg.is_manager_role_model && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          LEADERSHIP ROLE MODEL
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(msg.posted_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">{msg.message_content}</p>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-calm-border/60 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share a break success or invite peers to stand..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-emerald-500 outline-none transition-all placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
