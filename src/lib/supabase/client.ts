import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Profile,
  DeviceTelemetry,
  DailyAnalytics,
  MicrobreakLog,
  Challenge,
  ChallengeParticipant,
  SocialChatMessage,
  FleetDevice,
  WellnessBulletin,
  AnonymizedFeedback,
  DepartmentMetric,
  ExportTelemetryRow,
} from '@/types/database';
import {
  MOCK_PROFILES,
  MOCK_TELEMETRY,
  MOCK_DAILY_ANALYTICS,
  MOCK_MICROBREAK_LOGS,
  MOCK_CHALLENGES,
  MOCK_PARTICIPANTS,
  MOCK_CHAT,
  MOCK_FLEET_DEVICES,
  MOCK_BULLETINS,
  MOCK_FEEDBACK,
} from './mock-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isLiveSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local storage key helpers for persistent mock state
const STORAGE_KEYS = {
  PROFILES: 'desk_hub_profiles_v2',
  TELEMETRY: 'desk_hub_telemetry_v2',
  ANALYTICS: 'desk_hub_analytics_v2',
  MICROBREAKS: 'desk_hub_microbreaks_v2',
  CHALLENGES: 'desk_hub_challenges_v2',
  PARTICIPANTS: 'desk_hub_participants_v2',
  CHAT: 'desk_hub_chat_v2',
  FLEET: 'desk_hub_fleet_v2',
  BULLETINS: 'desk_hub_bulletins_v2',
  FEEDBACK: 'desk_hub_feedback_v2',
  CURRENT_USER_ID: 'desk_hub_current_user_id',
};

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage set failed', e);
  }
}

// Full memory store initialized from localStorage or mock fixtures
class DatabaseStore {
  private profiles: Profile[] = [];
  private telemetry: DeviceTelemetry[] = [];
  private analytics: DailyAnalytics[] = [];
  private microbreaks: MicrobreakLog[] = [];
  private challenges: Challenge[] = [];
  private participants: ChallengeParticipant[] = [];
  private chat: SocialChatMessage[] = [];
  private fleet: FleetDevice[] = [];
  private bulletins: WellnessBulletin[] = [];
  private feedback: AnonymizedFeedback[] = [];
  private initialized = false;

  private init() {
    if (this.initialized) return;
    this.profiles = getStored(STORAGE_KEYS.PROFILES, MOCK_PROFILES);
    this.telemetry = getStored(STORAGE_KEYS.TELEMETRY, MOCK_TELEMETRY);
    this.analytics = getStored(STORAGE_KEYS.ANALYTICS, MOCK_DAILY_ANALYTICS);
    this.microbreaks = getStored(STORAGE_KEYS.MICROBREAKS, MOCK_MICROBREAK_LOGS);
    this.challenges = getStored(STORAGE_KEYS.CHALLENGES, MOCK_CHALLENGES);
    this.participants = getStored(STORAGE_KEYS.PARTICIPANTS, MOCK_PARTICIPANTS);
    this.chat = getStored(STORAGE_KEYS.CHAT, MOCK_CHAT);
    this.fleet = getStored(STORAGE_KEYS.FLEET, MOCK_FLEET_DEVICES);
    this.bulletins = getStored(STORAGE_KEYS.BULLETINS, MOCK_BULLETINS);
    this.feedback = getStored(STORAGE_KEYS.FEEDBACK, MOCK_FEEDBACK);
    this.initialized = true;
  }

  // --- Profiles ---
  getProfiles(): Profile[] {
    this.init();
    return this.profiles;
  }

  getProfile(id: string): Profile | undefined {
    this.init();
    return this.profiles.find((p) => p.id === id);
  }

  updateProfile(id: string, updates: Partial<Profile>): Profile {
    this.init();
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.profiles[idx] = {
        ...this.profiles[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      setStored(STORAGE_KEYS.PROFILES, this.profiles);
      return this.profiles[idx];
    }
    throw new Error('Profile not found');
  }

  // --- Device Telemetry ---
  getTelemetry(userId?: string, isAdmin = false): DeviceTelemetry[] {
    this.init();
    if (isAdmin || !userId) {
      return [...this.telemetry].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    return this.telemetry
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addTelemetry(entry: Omit<DeviceTelemetry, 'id' | 'timestamp'>): DeviceTelemetry {
    this.init();
    const user = this.getProfile(entry.user_id);
    const newEntry: DeviceTelemetry = {
      ...entry,
      id: `tel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_name: entry.user_name || user?.display_name || 'Desk Hub User',
      department: entry.department || user?.department || 'General',
      device_id: entry.device_id || user?.device_id || 'hub-001',
      timestamp: new Date().toISOString(),
    };
    this.telemetry.unshift(newEntry);
    setStored(STORAGE_KEYS.TELEMETRY, this.telemetry);
    return newEntry;
  }

  recordAlertResolution(
    userId: string,
    latencySec: number,
    source: DeviceTelemetry['trigger_source'],
    action: DeviceTelemetry['compliance_action']
  ) {
    this.init();
    const user = this.getProfile(userId);
    this.addTelemetry({
      user_id: userId,
      user_name: user?.display_name,
      department: user?.department,
      device_id: user?.device_id,
      device_powered_on: true,
      current_mode: 'FOCUS',
      trigger_source: source,
      session_duration_seconds: latencySec,
      alert_response_latency_sec: latencySec,
      compliance_action: action,
    });

    // Update today's daily analytics entry
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = this.analytics.find((a) => a.user_id === userId && a.log_date === today);
    if (todayEntry) {
      todayEntry.alerts_acknowledged = (todayEntry.alerts_acknowledged || 0) + 1;
      const count = todayEntry.alerts_acknowledged;
      todayEntry.avg_latency_sec = Number(
        (((todayEntry.avg_latency_sec || 15) * (count - 1) + latencySec) / count).toFixed(1)
      );
      if (todayEntry.alerts_triggered > 0) {
        todayEntry.compliance_rate_pct = Number(
          ((todayEntry.alerts_acknowledged / todayEntry.alerts_triggered) * 100).toFixed(1)
        );
      }
      setStored(STORAGE_KEYS.ANALYTICS, this.analytics);
    }
  }

  // --- Daily Analytics ---
  getAnalytics(userId?: string, isAdmin = false): DailyAnalytics[] {
    this.init();
    if (isAdmin || !userId) {
      return [...this.analytics].sort(
        (a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
      );
    }
    return this.analytics
      .filter((a) => a.user_id === userId)
      .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
  }

  recordDailyZoneMinute(
    userId: string,
    zone: 'green' | 'yellow' | 'red',
    minutes = 1
  ): DailyAnalytics {
    this.init();
    const today = new Date().toISOString().split('T')[0];
    let entry = this.analytics.find((a) => a.user_id === userId && a.log_date === today);

    if (!entry) {
      const user = this.getProfile(userId);
      entry = {
        id: `da-${Date.now()}`,
        user_id: userId,
        user_name: user?.display_name || 'Desk Hub User',
        department: user?.department || 'General',
        log_date: today,
        green_zone_duration_min: 0,
        yellow_zone_duration_min: 0,
        red_zone_duration_min: 0,
        standing_accumulation_min: 0,
        breaker_classification: 'Moderate Breaker',
        estimated_kcal_increase: 0,
        alerts_triggered: 0,
        alerts_acknowledged: 0,
        avg_latency_sec: 14.0,
        compliance_rate_pct: 100,
        created_at: new Date().toISOString(),
      };
      this.analytics.unshift(entry);
    }

    if (zone === 'green') {
      entry.green_zone_duration_min += minutes;
      entry.standing_accumulation_min += minutes;
      entry.estimated_kcal_increase = Number(
        (entry.estimated_kcal_increase + minutes * 1.35).toFixed(1)
      );
    } else if (zone === 'yellow') {
      entry.yellow_zone_duration_min += minutes;
    } else if (zone === 'red') {
      entry.red_zone_duration_min += minutes;
    }

    // Dynamic Breaker Classification
    const totalMove = entry.green_zone_duration_min;
    const prolongedSed = entry.red_zone_duration_min;

    if (totalMove >= 120 && prolongedSed <= 45) {
      entry.breaker_classification = 'Top Breaker';
    } else if (totalMove >= 60 && prolongedSed <= 90) {
      entry.breaker_classification = 'Moderate Breaker';
    } else if (prolongedSed > 180) {
      entry.breaker_classification = 'Severe Prolonger';
    } else {
      entry.breaker_classification = 'Sedentary Prolonger';
    }

    setStored(STORAGE_KEYS.ANALYTICS, this.analytics);
    return entry;
  }

  // --- Microbreak Logs ---
  getMicrobreaks(userId?: string, isAdmin = false): MicrobreakLog[] {
    this.init();
    if (isAdmin || !userId) {
      return [...this.microbreaks].sort(
        (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );
    }
    return this.microbreaks
      .filter((m) => m.user_id === userId)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  }

  addMicrobreak(entry: Omit<MicrobreakLog, 'id' | 'completed_at'>): MicrobreakLog {
    this.init();
    const newEntry: MicrobreakLog = {
      ...entry,
      id: `mbl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      completed_at: new Date().toISOString(),
    };
    this.microbreaks.unshift(newEntry);
    setStored(STORAGE_KEYS.MICROBREAKS, this.microbreaks);

    // Also credit active green zone duration
    const minutes = Math.ceil(entry.duration_seconds / 60);
    this.recordDailyZoneMinute(entry.user_id, 'green', minutes);

    return newEntry;
  }

  // --- Challenges ---
  getChallenges(): Challenge[] {
    this.init();
    return this.challenges;
  }

  createChallenge(challenge: Omit<Challenge, 'id' | 'created_at'>): Challenge {
    this.init();
    const newCh: Challenge = {
      ...challenge,
      id: `ch-${Date.now()}`,
      created_at: new Date().toISOString(),
      participants_count: 1,
    };
    this.challenges.unshift(newCh);
    setStored(STORAGE_KEYS.CHALLENGES, this.challenges);
    return newCh;
  }

  getParticipants(challengeId: string): ChallengeParticipant[] {
    this.init();
    return this.participants
      .filter((p) => p.challenge_id === challengeId)
      .sort((a, b) => b.current_progress_value - a.current_progress_value);
  }

  joinOrIncrementChallenge(
    challengeId: string,
    userId: string,
    increment = 1
  ): ChallengeParticipant {
    this.init();
    let p = this.participants.find(
      (item) => item.challenge_id === challengeId && item.user_id === userId
    );

    const challenge = this.challenges.find((c) => c.id === challengeId);
    const target = challenge?.target_goal_value || 30;

    if (!p) {
      const user = this.getProfile(userId);
      p = {
        id: `cp-${Date.now()}`,
        challenge_id: challengeId,
        user_id: userId,
        user_name: user?.display_name || 'Desk Hub User',
        department: user?.department,
        avatar_url: user?.avatar_url,
        current_progress_value: increment,
        completed: increment >= target,
        updated_at: new Date().toISOString(),
      };
      this.participants.push(p);
    } else {
      p.current_progress_value += increment;
      if (p.current_progress_value >= target) {
        p.completed = true;
      }
      p.updated_at = new Date().toISOString();
    }

    setStored(STORAGE_KEYS.PARTICIPANTS, this.participants);
    return p;
  }

  // --- Social Chat ---
  getChat(challengeId?: string): SocialChatMessage[] {
    this.init();
    const filtered = challengeId
      ? this.chat.filter((c) => c.challenge_id === challengeId)
      : this.chat;
    return [...filtered].sort(
      (a, b) => new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime()
    );
  }

  addChatMessage(
    userId: string,
    content: string,
    challengeId?: string
  ): SocialChatMessage {
    this.init();
    const user = this.getProfile(userId);
    const newMsg: SocialChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      challenge_id: challengeId,
      user_id: userId,
      user_name: user?.display_name || 'Desk Hub User',
      user_role: user?.role || 'user',
      department: user?.department,
      avatar_url: user?.avatar_url,
      message_content: content,
      posted_at: new Date().toISOString(),
      is_manager_role_model: user?.role === 'admin' || user?.display_name.includes('Lead') || user?.display_name.includes('VP'),
    };
    this.chat.push(newMsg);
    setStored(STORAGE_KEYS.CHAT, this.chat);
    return newMsg;
  }

  // --- Hardware Fleet ---
  getFleetDevices(): FleetDevice[] {
    this.init();
    return this.fleet;
  }

  rebootFleetDevice(deviceId: string): FleetDevice | undefined {
    this.init();
    const dev = this.fleet.find((f) => f.id === deviceId);
    if (dev) {
      dev.connection_status = 'online';
      dev.last_heartbeat = new Date().toISOString();
      dev.error_count = 0;
      setStored(STORAGE_KEYS.FLEET, this.fleet);
      return dev;
    }
    return undefined;
  }

  // --- Department Analytics ---
  getDepartmentMetrics(): DepartmentMetric[] {
    this.init();
    const deptMap: Record<
      string,
      {
        count: number;
        totalCompliance: number;
        totalSittingMins: number;
        totalLatency: number;
        breakers: number;
        microbreaksCount: number;
      }
    > = {};

    this.profiles.forEach((p) => {
      const dept = p.department || 'General';
      if (!deptMap[dept]) {
        deptMap[dept] = {
          count: 0,
          totalCompliance: 0,
          totalSittingMins: 0,
          totalLatency: 0,
          breakers: 0,
          microbreaksCount: 0,
        };
      }
      deptMap[dept].count += 1;

      // Find user analytics
      const userAnalytic = this.analytics.find((a) => a.user_id === p.id);
      if (userAnalytic) {
        deptMap[dept].totalCompliance += userAnalytic.compliance_rate_pct || 85;
        deptMap[dept].totalSittingMins +=
          (userAnalytic.yellow_zone_duration_min + userAnalytic.red_zone_duration_min);
        deptMap[dept].totalLatency += userAnalytic.avg_latency_sec || 16;
        if (
          userAnalytic.breaker_classification === 'Top Breaker' ||
          userAnalytic.breaker_classification === 'Moderate Breaker'
        ) {
          deptMap[dept].breakers += 1;
        }
      } else {
        deptMap[dept].totalCompliance += 80;
        deptMap[dept].totalSittingMins += 300;
        deptMap[dept].totalLatency += 20;
        deptMap[dept].breakers += 1;
      }

      const breaks = this.microbreaks.filter((m) => m.user_id === p.id).length;
      deptMap[dept].microbreaksCount += breaks;
    });

    return Object.entries(deptMap).map(([department, data]) => ({
      department,
      headcount: data.count,
      avg_compliance_rate_pct: Math.round(data.totalCompliance / Math.max(data.count, 1)),
      avg_prolonged_sitting_hours: Number(
        (data.totalSittingMins / Math.max(data.count, 1) / 60).toFixed(1)
      ),
      avg_alert_response_sec: Math.round(data.totalLatency / Math.max(data.count, 1)),
      active_microbreak_adoption_pct: Math.min(
        Math.round((data.microbreaksCount / Math.max(data.count * 3, 1)) * 100),
        100
      ),
      breaker_ratio: Math.round((data.breakers / Math.max(data.count, 1)) * 100),
    }));
  }

  // --- Export Telemetry Rows for XLSX / CSV Generation ---
  getExportData(params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
    anonymize?: boolean;
  }): ExportTelemetryRow[] {
    this.init();
    const rows: ExportTelemetryRow[] = [];

    this.analytics.forEach((analytic) => {
      const user = this.getProfile(analytic.user_id);
      const userDept = analytic.department || user?.department || 'General';

      if (params?.department && params.department !== 'all' && userDept !== params.department) {
        return;
      }

      if (params?.startDate && analytic.log_date < params.startDate) {
        return;
      }
      if (params?.endDate && analytic.log_date > params.endDate) {
        return;
      }

      const totalSittingHours = Number(
        ((analytic.yellow_zone_duration_min + analytic.red_zone_duration_min) / 60).toFixed(2)
      );

      // Estimate unbroken bouts > 60m from red zone duration
      const unbrokenBouts = Math.max(Math.floor(analytic.red_zone_duration_min / 60), analytic.red_zone_duration_min > 30 ? 1 : 0);

      const empId = params?.anonymize
        ? `ANON-${Math.abs(analytic.user_id.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0) % 10000).toString().padStart(4, '0')}`
        : user?.employee_id || analytic.user_id;

      rows.push({
        Employee_ID: empId,
        Department: userDept,
        Date: analytic.log_date,
        Total_Sitting_Hours: totalSittingHours,
        'Unbroken_Bouts_Count (>60m)': unbrokenBouts,
        Alerts_Triggered: analytic.alerts_triggered || 8,
        Alerts_Acknowledged: analytic.alerts_acknowledged || 7,
        'Compliance_Rate_%': analytic.compliance_rate_pct || 87.5,
        Avg_Response_Time_Sec: analytic.avg_latency_sec || 15.2,
      });
    });

    return rows.sort((a, b) => (b.Date > a.Date ? 1 : -1));
  }

  // --- Bulletins ---
  getBulletins(): WellnessBulletin[] {
    this.init();
    return this.bulletins;
  }

  addBulletin(bulletin: Omit<WellnessBulletin, 'id' | 'posted_date' | 'views_count'>): WellnessBulletin {
    this.init();
    const newBul: WellnessBulletin = {
      ...bulletin,
      id: `bul-${Date.now()}`,
      posted_date: new Date().toISOString().split('T')[0],
      views_count: 1,
    };
    this.bulletins.unshift(newBul);
    setStored(STORAGE_KEYS.BULLETINS, this.bulletins);
    return newBul;
  }

  // --- Feedback ---
  getFeedback(): AnonymizedFeedback[] {
    this.init();
    return this.feedback;
  }

  addFeedback(feedbackText: string, department: string, sentiment: AnonymizedFeedback['sentiment']): AnonymizedFeedback {
    this.init();
    const newFb: AnonymizedFeedback = {
      id: `fb-${Date.now()}`,
      department,
      sentiment,
      feedback_text: feedbackText,
      submitted_at: new Date().toISOString(),
      status: 'Reviewed',
    };
    this.feedback.unshift(newFb);
    setStored(STORAGE_KEYS.FEEDBACK, this.feedback);
    return newFb;
  }
}

export const dbStore = new DatabaseStore();
