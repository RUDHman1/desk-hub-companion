'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDevice } from '@/context/DeviceContext';
import { dbStore } from '@/lib/supabase/client';
import { MICROBREAK_PROTOCOLS } from '@/lib/protocols';
import { MicrobreakProtocol, MicrobreakLog } from '@/types/database';
import {
  Timer,
  Play,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Flame,
  Brain,
  Bone,
  Zap,
  Info,
  ChevronRight,
  Clock,
  X,
  Volume2,
  Video,
  Pause,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MicrobreaksPage() {
  const { user } = useAuth();
  const { triggerBreakComplete, soundEnabled } = useDevice();

  const [activeProtocol, setActiveProtocol] = useState<MicrobreakProtocol | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [stepSecondsRemaining, setStepSecondsRemaining] = useState<number>(30);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedLogs, setCompletedLogs] = useState<MicrobreakLog[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Sit-Stand-Walk Protocol Timer State (20-8-2 or 30-2)
  const [sitStandProtocol, setSitStandProtocol] = useState<'20-8-2' | '30-2'>('20-8-2');
  const [sitStandPhase, setSitStandPhase] = useState<'sit' | 'stand' | 'walk'>('sit');
  const [sitStandSecondsRemaining, setSitStandSecondsRemaining] = useState<number>(20 * 60);
  const [isSitStandRunning, setIsSitStandRunning] = useState<boolean>(false);

  useEffect(() => {
    setCompletedLogs(dbStore.getMicrobreaks(user.id));
  }, [user.id]);

  // Handle active guided routine step timer
  useEffect(() => {
    if (!isRunning || !activeProtocol) return;

    const currentStep = activeProtocol.instructions[currentStepIndex];
    if (!currentStep) return;

    const interval = setInterval(() => {
      setStepSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (currentStepIndex < activeProtocol.instructions.length - 1) {
            setCurrentStepIndex((idx) => idx + 1);
            return activeProtocol.instructions[currentStepIndex + 1].durationSec;
          } else {
            finishRoutine();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, activeProtocol, currentStepIndex]);

  // Handle Sit-Stand-Walk Cycle Timer
  useEffect(() => {
    if (!isSitStandRunning) return;

    const interval = setInterval(() => {
      setSitStandSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Transition phase
          if (sitStandProtocol === '20-8-2') {
            if (sitStandPhase === 'sit') {
              setSitStandPhase('stand');
              return 8 * 60;
            } else if (sitStandPhase === 'stand') {
              setSitStandPhase('walk');
              return 2 * 60;
            } else {
              setSitStandPhase('sit');
              return 20 * 60;
            }
          } else {
            // 30-2
            if (sitStandPhase === 'sit') {
              setSitStandPhase('walk');
              return 2 * 60;
            } else {
              setSitStandPhase('sit');
              return 30 * 60;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSitStandRunning, sitStandPhase, sitStandProtocol]);

  const switchSitStandProtocol = (proto: '20-8-2' | '30-2') => {
    setSitStandProtocol(proto);
    setSitStandPhase('sit');
    setSitStandSecondsRemaining(proto === '20-8-2' ? 20 * 60 : 30 * 60);
    setIsSitStandRunning(false);
  };

  const startRoutine = (protocol: MicrobreakProtocol) => {
    setActiveProtocol(protocol);
    setCurrentStepIndex(0);
    setStepSecondsRemaining(protocol.instructions[0].durationSec);
    setIsRunning(true);
  };

  const finishRoutine = () => {
    if (!activeProtocol) return;

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }

    triggerBreakComplete(activeProtocol.name, activeProtocol.durationSeconds);
    setCompletedLogs(dbStore.getMicrobreaks(user.id));
    setIsRunning(false);
    setActiveProtocol(null);
  };

  const cancelRoutine = () => {
    setIsRunning(false);
    setActiveProtocol(null);
  };

  const filteredProtocols =
    filterCategory === 'all'
      ? MICROBREAK_PROTOCOLS
      : MICROBREAK_PROTOCOLS.filter((p) => p.category === filterCategory);

  const formatSitStandTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-calm-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Microbreak Hub & Movement Prescriptions
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Evidence-Based Library
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Clinically verified 2-minute movement prescriptions designed to reactivate muscular
            lipoprotein lipase (LPL), decompress spinal discs, and restore prefrontal cognitive
            focus.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{completedLogs.length} breaks completed today</span>
        </div>
      </div>

      {/* Sit-Stand-Walk Protocol Interactive Section */}
      <div className="bg-gradient-to-r from-slate-900 via-calm-surface to-slate-900 border border-calm-border rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">
                Postural Transition Rhythm
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Cornell University
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight mt-1">
              Active Sit-Stand-Walk Interval Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automates the Cornell 20-8-2 or 30-2 cadence with live phase transitions.
            </p>
          </div>

          {/* Protocol Toggle Buttons */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => switchSitStandProtocol('20-8-2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                sitStandProtocol === '20-8-2'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cornell 20-8-2
            </button>
            <button
              onClick={() => switchSitStandProtocol('30-2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                sitStandProtocol === '30-2'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Standard 30-2
            </button>
          </div>
        </div>

        {/* Phase Flow Indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              sitStandPhase === 'sit'
                ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-slate-950/60 border-slate-800/80 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-amber-300 font-semibold">1. SITTING PHASE</span>
              <span className="text-[10px] font-mono text-slate-400">
                {sitStandProtocol === '20-8-2' ? '20 Min' : '30 Min'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Neutral lumbar spine posture, elbows at 90°, keyboard close.
            </p>
          </div>

          {sitStandProtocol === '20-8-2' && (
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                sitStandPhase === 'stand'
                  ? 'bg-sky-500/15 border-sky-500/50 shadow-md shadow-sky-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-sky-300 font-semibold">2. STANDING PHASE</span>
                <span className="text-[10px] font-mono text-slate-400">8 Min</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Weight balanced evenly across both feet; avoid static locking of knees.
              </p>
            </div>
          )}

          <div
            className={`p-3.5 rounded-xl border transition-all ${
              sitStandPhase === 'walk'
                ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800/80 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-emerald-300 font-semibold">
                {sitStandProtocol === '20-8-2' ? '3. WALKING / MOVING' : '2. ACTIVE BREAK'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">2 Min</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Active locomotion, calf presses, or stretching to trigger venous pump.
            </p>
          </div>
        </div>

        {/* Live Phase Counter & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-lg font-bold text-slate-100">
              {formatSitStandTime(sitStandSecondsRemaining)}
            </div>
            <div className="text-xs">
              <span className="text-slate-400">Current Phase: </span>
              <span className="font-semibold uppercase font-mono text-emerald-400">
                {sitStandPhase} ({sitStandPhase === 'sit' ? 'Focus Work' : sitStandPhase === 'stand' ? 'Dynamic Standing' : 'Active Movement'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSitStandRunning(!isSitStandRunning)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              {isSitStandRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSitStandRunning ? 'Pause Cadence' : 'Start Posture Cadence'}</span>
            </button>
            <button
              onClick={() => {
                setIsSitStandRunning(false);
                setSitStandPhase('sit');
                setSitStandSecondsRemaining(sitStandProtocol === '20-8-2' ? 20 * 60 : 30 * 60);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
              title="Reset Cadence"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Movement Prescriptions' },
          { id: 'active_bout', label: '⚡ Active Bouts (Squats & Calves)' },
          { id: 'posture', label: '🦴 Musculoskeletal Stretching' },
          { id: 'ergonomic', label: '📐 Ergonomic Posture' },
          { id: 'cognitive', label: '🧠 Cognitive Restoration (ART)' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              filterCategory === cat.id
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                : 'bg-calm-surface text-slate-400 hover:text-slate-200 border-calm-border hover:bg-slate-800/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Protocols Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProtocols.map((protocol) => {
          const isErgonomic = protocol.category === 'ergonomic';
          const isCognitive = protocol.category === 'cognitive';
          const isActiveBout = protocol.category === 'active_bout';

          return (
            <div
              key={protocol.id}
              className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Category indicator line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isCognitive
                    ? 'bg-purple-500'
                    : isActiveBout
                    ? 'bg-amber-500'
                    : isErgonomic
                    ? 'bg-emerald-500'
                    : 'bg-sky-500'
                }`}
              />

              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span
                    className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                      isCognitive
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                        : isActiveBout
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        : isErgonomic
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                    }`}
                  >
                    {protocol.category.replace('_', ' ')}
                  </span>

                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {protocol.durationSeconds}s ({Math.ceil(protocol.durationSeconds / 60)}m)
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-base font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {protocol.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {protocol.subtitle}
                </p>

                {/* Animated Visual Demonstration Card */}
                <div className="my-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-2 font-mono text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Video className="w-3 h-3" />
                      Visual Demonstration Guide
                    </span>
                    <span className="uppercase text-slate-500">{protocol.difficulty} Pace</span>
                  </div>

                  {/* Muscle Targets */}
                  <div className="flex flex-wrap gap-1.5">
                    {protocol.targetMuscles.map((muscle) => (
                      <span
                        key={muscle}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Physiological Rationale Section */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 flex items-center gap-1 mb-0.5">
                      <Flame className="w-3 h-3" />
                      Metabolic Impact
                    </span>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {protocol.metabolicImpact}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-sky-400 flex items-center gap-1 mb-0.5">
                      <Brain className="w-3 h-3" />
                      Cognitive & Biomechanical Rationale
                    </span>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {protocol.cognitiveBenefit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={() => startRoutine(protocol)}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 group-hover:bg-emerald-500 group-hover:text-slate-950"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Begin Guided 2-Min Routine</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Guided Runner Modal */}
      {activeProtocol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-calm-surface border border-calm-border max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-calm-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">
                  Guided Movement Runner
                </span>
                <h3 className="text-base font-bold text-slate-100">{activeProtocol.name}</h3>
              </div>
              <button
                onClick={cancelRoutine}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Countdown Body */}
            <div className="p-6 text-center space-y-5">
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-1.5">
                {activeProtocol.instructions.map((step, idx) => (
                  <span
                    key={step.step}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? 'w-8 bg-emerald-400'
                        : idx < currentStepIndex
                        ? 'w-4 bg-emerald-700'
                        : 'w-4 bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Step countdown circle */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center rounded-full bg-slate-950 border-4 border-emerald-500/40 shadow-xl shadow-emerald-500/10">
                <div className="text-center">
                  <span className="text-3xl font-mono font-bold text-emerald-400">
                    {stepSecondsRemaining}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-400 uppercase">
                    Seconds
                  </span>
                </div>
              </div>

              {/* Step Title & Instruction */}
              <div>
                <span className="text-xs font-mono uppercase text-slate-400">
                  Step {currentStepIndex + 1} of {activeProtocol.instructions.length}
                </span>
                <h4 className="text-lg font-bold text-slate-100 mt-1">
                  {activeProtocol.instructions[currentStepIndex].title}
                </h4>
                <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                  {activeProtocol.instructions[currentStepIndex].description}
                </p>
              </div>

              {/* Metabolic Benefit Note */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs flex items-center gap-2 text-slate-400">
                <Flame className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-[11px]">{activeProtocol.metabolicImpact}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-calm-border flex items-center justify-between">
              <button
                onClick={cancelRoutine}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium"
              >
                Cancel Routine
              </button>

              <button
                onClick={() => {
                  if (currentStepIndex < activeProtocol.instructions.length - 1) {
                    setCurrentStepIndex((idx) => idx + 1);
                    setStepSecondsRemaining(
                      activeProtocol.instructions[currentStepIndex + 1].durationSec
                    );
                  } else {
                    finishRoutine();
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <span>
                  {currentStepIndex < activeProtocol.instructions.length - 1
                    ? 'Next Step'
                    : 'Complete Routine'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
