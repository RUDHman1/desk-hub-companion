import { MelodyNote } from '@/types/database';

export const NOTE_FREQUENCIES: Record<string, number> = {
  // Octave 3
  C3: 130.81,
  'C#3': 138.59,
  Db3: 138.59,
  D3: 146.83,
  'D#3': 155.56,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  'F#3': 185.0,
  Gb3: 185.0,
  G3: 196.0,
  'G#3': 207.65,
  Ab3: 207.65,
  A3: 220.0,
  'A#3': 233.08,
  Bb3: 233.08,
  B3: 246.94,

  // Octave 4
  C4: 261.63,
  'C#4': 277.18,
  Db4: 277.18,
  D4: 293.66,
  'D#4': 311.13,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  'F#4': 369.99,
  Gb4: 369.99,
  G4: 392.0,
  'G#4': 415.3,
  Ab4: 415.3,
  A4: 440.0,
  'A#4': 466.16,
  Bb4: 466.16,
  B4: 493.88,

  // Octave 5
  C5: 523.25,
  'C#5': 554.37,
  Db5: 554.37,
  D5: 587.33,
  'D#5': 622.25,
  Eb5: 622.25,
  E5: 659.25,
  F5: 698.46,
  'F#5': 739.99,
  Gb5: 739.99,
  G5: 783.99,
  'G#5': 830.61,
  Ab5: 830.61,
  A5: 880.0,
  'A#5': 932.33,
  Bb5: 932.33,
  B5: 987.77,

  // Octave 6
  C6: 1046.5,
  D6: 1174.66,
  E6: 1318.51,
  G6: 1567.98,
};

// 19-note Star Wars fanfare array matching the physical Arduino Desk Hub buzzer firmware
export const STAR_WARS_FANFARE: MelodyNote[] = [
  { note: 'D4', duration: 380 },
  { note: 'D4', duration: 380 },
  { note: 'D4', duration: 380 },
  { note: 'G4', duration: 550 },
  { note: 'D5', duration: 550 },
  { note: 'C5', duration: 180 },
  { note: 'B4', duration: 180 },
  { note: 'A4', duration: 180 },
  { note: 'G5', duration: 650 },
  { note: 'D5', duration: 380 },
  { note: 'C5', duration: 180 },
  { note: 'B4', duration: 180 },
  { note: 'A4', duration: 180 },
  { note: 'G5', duration: 650 },
  { note: 'D5', duration: 380 },
  { note: 'C5', duration: 180 },
  { note: 'B4', duration: 180 },
  { note: 'C5', duration: 180 },
  { note: 'A4', duration: 750 },
];

export const CALM_CHIME: MelodyNote[] = [
  { note: 'C4', duration: 250 },
  { note: 'E4', duration: 250 },
  { note: 'G4', duration: 250 },
  { note: 'C5', duration: 500 },
];

export const VIBRANT_BEAT: MelodyNote[] = [
  { note: 'E4', duration: 200 },
  { note: 'G4', duration: 200 },
  { note: 'A4', duration: 300 },
  { note: 'E5', duration: 400 },
];

export const RETRO_LEVEL_UP: MelodyNote[] = [
  { note: 'C4', duration: 100 },
  { note: 'E4', duration: 100 },
  { note: 'G4', duration: 100 },
  { note: 'C5', duration: 120 },
  { note: 'E5', duration: 120 },
  { note: 'G5', duration: 220 },
  { note: 'C6', duration: 450 },
];

export const CYBERPUNK_PULSE: MelodyNote[] = [
  { note: 'F3', duration: 140 },
  { note: 'F3', duration: 140 },
  { note: 'Ab3', duration: 180 },
  { note: 'C4', duration: 180 },
  { note: 'Eb4', duration: 240 },
  { note: 'F4', duration: 420 },
];

export const TIBETAN_BOWL: MelodyNote[] = [
  { note: 'G3', duration: 650 },
  { note: 'D4', duration: 650 },
  { note: 'G4', duration: 1100 },
];

export const MARIMBA_WAKE: MelodyNote[] = [
  { note: 'F4', duration: 130 },
  { note: 'A4', duration: 130 },
  { note: 'C5', duration: 150 },
  { note: 'D5', duration: 170 },
  { note: 'F5', duration: 320 },
];

export const PIEZO_URGENT: MelodyNote[] = [
  { note: 'B5', duration: 110 },
  { note: 'B5', duration: 110 },
  { note: 'B5', duration: 110 },
  { note: 'E6', duration: 380 },
];

export const SONIC_BLOOM: MelodyNote[] = [
  { note: 'D4', duration: 200 },
  { note: 'A4', duration: 200 },
  { note: 'F#5', duration: 250 },
  { note: 'B5', duration: 500 },
];

export interface AudioToneOption {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  category: 'Calm & Zen' | 'Retro & Sci-Fi' | 'Urgent & Classic';
  waveform: OscillatorType;
  volume: number;
  notes: MelodyNote[];
}

export const AUDIO_TONES: AudioToneOption[] = [
  {
    id: 'fanfare',
    name: 'Star Wars Fanfare (19-Note Array)',
    subtitle: 'Signature Arduino Desk Hub Firmware Melody',
    description: 'Energetic, impossible to miss 440Hz – 880Hz brass line matching the physical Arduino Desk Hub sketch.',
    category: 'Retro & Sci-Fi',
    waveform: 'square',
    volume: 0.15,
    notes: STAR_WARS_FANFARE,
  },
  {
    id: 'gentle_chime',
    name: 'Gentle Calm Chime (Pentatonic Bell)',
    subtitle: 'Soft harmonic acoustic bell',
    description: 'Low cognitive load, soft harmonious chime for shared office or call environments.',
    category: 'Calm & Zen',
    waveform: 'sine',
    volume: 0.14,
    notes: CALM_CHIME,
  },
  {
    id: 'retro_level_up',
    name: '8-Bit Retro Level-Up (Arcade)',
    subtitle: 'Fast rising GameBoy arpeggio',
    description: 'Nostalgic 8-bit game victory riff celebrating your completion of a sitting block.',
    category: 'Retro & Sci-Fi',
    waveform: 'square',
    volume: 0.14,
    notes: RETRO_LEVEL_UP,
  },
  {
    id: 'cyberpunk_pulse',
    name: 'Cyberpunk Pulse (Synthwave)',
    subtitle: 'Futuristic electronic synthesizer line',
    description: 'Punchy saw-wave synthesizer bassline motif with futuristic electronic attack.',
    category: 'Retro & Sci-Fi',
    waveform: 'sawtooth',
    volume: 0.12,
    notes: CYBERPUNK_PULSE,
  },
  {
    id: 'tibetan_bowl',
    name: 'Tibetan Singing Bowl (Mindful Zen)',
    subtitle: 'Resonant harmonic low bell',
    description: 'Deep meditative resonant tone with slow decay to induce a relaxed, mindful transition.',
    category: 'Calm & Zen',
    waveform: 'sine',
    volume: 0.16,
    notes: TIBETAN_BOWL,
  },
  {
    id: 'marimba_wake',
    name: 'Marimba Morning (Playful Woodblock)',
    subtitle: 'Warm acoustic wooden mallet cadence',
    description: 'Warm, organic wooden mallet cadence simulating an acoustic acoustic marimba.',
    category: 'Calm & Zen',
    waveform: 'triangle',
    volume: 0.15,
    notes: MARIMBA_WAKE,
  },
  {
    id: 'piezo_urgent',
    name: 'Classic Digital Piezo Alarm (Urgent)',
    subtitle: 'High-contrast 2.4kHz piezoelectric tone',
    description: 'Sharp, urgent double-pulse alert for deep-focus prolongers who tend to ignore gentle cues.',
    category: 'Urgent & Classic',
    waveform: 'square',
    volume: 0.18,
    notes: PIEZO_URGENT,
  },
  {
    id: 'sonic_bloom',
    name: 'Sonic Bloom (Modern Ergonomic)',
    subtitle: 'Clean two-step frequency sweep',
    description: 'Aesthetic ascending harmonic sweep designed to sound pleasant yet unmistakably distinct.',
    category: 'Calm & Zen',
    waveform: 'sine',
    volume: 0.14,
    notes: SONIC_BLOOM,
  },
];

export function getAudioTone(id: string): AudioToneOption {
  const found = AUDIO_TONES.find((t) => t.id === id);
  return found || AUDIO_TONES[0];
}

let audioCtx: AudioContext | null = null;
let activeMelodyTimeoutIds: number[] = [];

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopMelody() {
  activeMelodyTimeoutIds.forEach((id) => clearTimeout(id));
  activeMelodyTimeoutIds = [];
}

export function playTone(
  freq: number,
  durationMs: number,
  type: OscillatorType = 'square',
  volume = 0.15
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Smooth envelope attack and release to avoid sharp speaker pops
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000 + 0.05);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

export function playNote(noteName: string, durationMs: number = 300) {
  const freq = NOTE_FREQUENCIES[noteName] || 440;
  playTone(freq, durationMs, 'square', 0.12);
}

export function playMelody(
  notes: MelodyNote[],
  soundEnabled = true,
  onProgress?: (index: number) => void,
  onComplete?: () => void,
  waveform: OscillatorType = 'square',
  volume = 0.15
) {
  if (!soundEnabled || !notes || notes.length === 0) return;
  stopMelody();

  let accumulatedDelay = 0;

  notes.forEach((item, index) => {
    const tId = window.setTimeout(() => {
      const freq = item.frequency || NOTE_FREQUENCIES[item.note] || 440;
      playTone(freq, item.duration * 0.85, waveform, volume);
      if (onProgress) onProgress(index);

      if (index === notes.length - 1 && onComplete) {
        window.setTimeout(onComplete, item.duration);
      }
    }, accumulatedDelay);

    activeMelodyTimeoutIds.push(tId);
    accumulatedDelay += item.duration;
  });
}

export function playToneById(
  toneId: string,
  soundEnabled = true,
  onProgress?: (index: number) => void,
  onComplete?: () => void
) {
  const tone = getAudioTone(toneId);
  playMelody(tone.notes, soundEnabled, onProgress, onComplete, tone.waveform, tone.volume);
}

export function playAlertBuzzer() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Emulate Arduino alert buzzer pulsing tone (900Hz / 1200Hz alternating)
  playTone(900, 150, 'sawtooth', 0.2);
  setTimeout(() => playTone(1200, 200, 'sawtooth', 0.2), 180);
}

export function playGentleBell() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Sine wave soft chime for calm tech transitions
  playTone(NOTE_FREQUENCIES.E5, 450, 'sine', 0.1);
  setTimeout(() => playTone(NOTE_FREQUENCIES.B5, 600, 'sine', 0.08), 200);
}
