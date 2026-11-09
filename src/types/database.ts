export type UserRole = 'user' | 'admin';

export type DeviceMode = 'FOCUS' | 'ALERT' | 'STANDBY' | 'OFF';

export type TriggerSource =
  | 'IR_CMD_RESET'
  | 'IR_CMD_POWER'
  | 'IR_CMD_MUTE'
  | 'IR_CMD_SNOOZE'
  | 'AUTO_TIMEOUT'
  | 'PIR_SENSOR'
  | 'WEB_SIMULATOR'
  | 'MICROBREAK_FINISH';

export type BreakerClassification =
  | 'Top Breaker'
  | 'Moderate Breaker'
  | 'Sedentary Prolonger'
  | 'Severe Prolonger';

export interface MelodyNote {
  note: string;
  duration: number; // in milliseconds
  frequency?: number; // Hz for Web Audio API synthesis
}

export type ConnectionStatus = 'connected' | 'simulated' | 'disconnected';
export type DeviceHardwareMode = 'hardware' | 'simulated';

export type AudioToneId =
  | 'fanfare'
  | 'gentle_chime'
  | 'retro_level_up'
  | 'cyberpunk_pulse'
  | 'tibetan_bowl'
  | 'marimba_wake'
  | 'piezo_urgent'
  | 'sonic_bloom';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  employee_id?: string;
  department?: string;
  office_location?: string;
  avatar_url?: string;
  alert_interval: number; // in minutes (20 - 45 default)
  sound_enabled: boolean;
  audio_preference?: AudioToneId | string;
  custom_melody: MelodyNote[];
  oled_ticker_text: string;
  device_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceTelemetry {
  id: string;
  user_id: string;
  user_name?: string;
  department?: string;
  device_id?: string;
  device_powered_on: boolean;
  current_mode: DeviceMode;
  trigger_source: TriggerSource;
  session_duration_seconds: number;
  alert_response_latency_sec?: number; // Response time from Red Alert to clearance
  compliance_action?: 'microbreak_cleared' | 'manual_dismiss' | 'ignored_timeout';
  timestamp: string;
}

export interface DailyAnalytics {
  id: string;
  user_id: string;
  user_name?: string;
  department?: string;
  log_date: string; // YYYY-MM-DD
  green_zone_duration_min: number; // Active movement time
  yellow_zone_duration_min: number; // Sitting < 60m
  red_zone_duration_min: number; // Prolonged unbroken sitting > 60m
  standing_accumulation_min: number; // Target 120-240 min
  breaker_classification: BreakerClassification;
  estimated_kcal_increase: number;
  alerts_triggered: number;
  alerts_acknowledged: number;
  avg_latency_sec: number;
  compliance_rate_pct: number;
  created_at: string;
}

export interface MicrobreakLog {
  id: string;
  user_id: string;
  user_name?: string;
  protocol_type: string;
  duration_seconds: number;
  completed_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  department?: string;
  start_date: string;
  end_date: string;
  target_metric_type: 'standing_minutes' | 'break_count' | 'sedentary_reduction_pct' | 'steps';
  target_goal_value: number;
  created_at: string;
  participants_count?: number;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  user_name: string;
  department?: string;
  avatar_url?: string;
  current_progress_value: number;
  completed: boolean;
  updated_at: string;
}

export interface SocialChatMessage {
  id: string;
  challenge_id?: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  department?: string;
  avatar_url?: string;
  message_content: string;
  posted_at: string;
  is_manager_role_model?: boolean;
}

export interface FleetDevice {
  id: string;
  mac_address: string;
  ip_address: string;
  assigned_user_id: string;
  assigned_user_name: string;
  department: string;
  hardware_model: string;
  firmware_version: string;
  connection_status: 'online' | 'standby' | 'offline';
  battery_level_pct: number;
  power_source: 'USB-C Line' | 'Battery Standby';
  last_heartbeat: string;
  error_count: number;
  signal_strength_dbm: number;
}

export interface DepartmentMetric {
  department: string;
  headcount: number;
  avg_compliance_rate_pct: number;
  avg_prolonged_sitting_hours: number;
  avg_alert_response_sec: number;
  active_microbreak_adoption_pct: number;
  breaker_ratio: number; // % who are Top/Moderate Breakers
}

export interface WellnessBulletin {
  id: string;
  title: string;
  category: 'Ergonomics' | 'Cardiovascular' | 'Focus & Flow' | 'Mental Health';
  summary: string;
  author: string;
  posted_date: string;
  views_count: number;
  action_label?: string;
}

export interface AnonymizedFeedback {
  id: string;
  department: string;
  sentiment: 'positive' | 'constructive' | 'urgent' | 'suggestion';
  feedback_text: string;
  submitted_at: string;
  status: 'Reviewed' | 'Action Planned' | 'Completed';
}

export interface ExportTelemetryRow {
  Employee_ID: string;
  Department: string;
  Date: string;
  Total_Sitting_Hours: number;
  'Unbroken_Bouts_Count (>60m)': number;
  Alerts_Triggered: number;
  Alerts_Acknowledged: number;
  'Compliance_Rate_%': number;
  Avg_Response_Time_Sec: number;
}

export interface MicrobreakProtocol {
  id: string;
  name: string;
  subtitle: string;
  category: 'ergonomic' | 'active_bout' | 'cognitive' | 'posture';
  durationSeconds: number;
  difficulty: 'Gentle' | 'Moderate' | 'Invigorating';
  targetMuscles: string[];
  physiologicalRationale: string;
  metabolicImpact: string;
  cognitiveBenefit: string;
  demoAnimationType?: 'stretch' | 'squats' | 'calf_raises' | 'eyes_reset';
  instructions: {
    step: number;
    title: string;
    description: string;
    durationSec: number;
  }[];
}
