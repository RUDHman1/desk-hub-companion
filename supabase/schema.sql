-- ====================================================================
-- Desk Hub Companion - Complete Supabase PostgreSQL Schema & Migrations
-- Production-Ready with Row Level Security (RLS) & Role-Based Access
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles, Roles & Hardware Configuration
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    display_name TEXT NOT NULL DEFAULT 'Desk Hub User',
    avatar_url TEXT,
    alert_interval INTEGER NOT NULL DEFAULT 25 CHECK (alert_interval BETWEEN 10 AND 120), -- minutes
    sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    custom_melody JSONB DEFAULT '[
      {"note": "D4", "duration": 500},
      {"note": "D4", "duration": 500},
      {"note": "D4", "duration": 500},
      {"note": "G4", "duration": 350},
      {"note": "D5", "duration": 150},
      {"note": "C5", "duration": 500},
      {"note": "B4", "duration": 350},
      {"note": "A4", "duration": 150},
      {"note": "G5", "duration": 500},
      {"note": "D5", "duration": 350},
      {"note": "C5", "duration": 500},
      {"note": "B4", "duration": 350},
      {"note": "A4", "duration": 150},
      {"note": "G5", "duration": 500},
      {"note": "D5", "duration": 350},
      {"note": "C5", "duration": 500},
      {"note": "B4", "duration": 350},
      {"note": "C5", "duration": 150},
      {"note": "A4", "duration": 650}
    ]'::jsonb,
    oled_ticker_text TEXT NOT NULL DEFAULT 'DESK HUB • KEEP ACTIVE • FOCUS 25M',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Device Telemetry Logs
CREATE TABLE IF NOT EXISTS public.device_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_powered_on BOOLEAN NOT NULL DEFAULT TRUE,
    current_mode TEXT NOT NULL CHECK (current_mode IN ('FOCUS', 'ALERT', 'STANDBY', 'OFF')),
    trigger_source TEXT NOT NULL CHECK (trigger_source IN ('IR_CMD_RESET', 'IR_CMD_POWER', 'IR_CMD_MUTE', 'AUTO_TIMEOUT', 'PIR_SENSOR', 'WEB_SIMULATOR', 'MICROBREAK_FINISH')),
    session_duration_seconds INTEGER NOT NULL DEFAULT 0,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Daily Sedentary & Movement Analytics
CREATE TABLE IF NOT EXISTS public.daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    green_zone_duration_min INTEGER NOT NULL DEFAULT 0,   -- Active / movement time
    yellow_zone_duration_min INTEGER NOT NULL DEFAULT 0,  -- Sitting < 60 min intervals
    red_zone_duration_min INTEGER NOT NULL DEFAULT 0,     -- Prolonged sitting > 60 min
    standing_accumulation_min INTEGER NOT NULL DEFAULT 0, -- Target: 120-240 min (2-4h)
    breaker_classification TEXT NOT NULL DEFAULT 'Moderate' CHECK (breaker_classification IN ('Top Breaker', 'Moderate Breaker', 'Sedentary Prolonger', 'Severe Prolonger')),
    estimated_kcal_increase NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_daily_log UNIQUE (user_id, log_date)
);

-- 5. Microbreak Logs
CREATE TABLE IF NOT EXISTS public.microbreak_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    protocol_type TEXT NOT NULL, -- e.g., '20-8-2 Protocol', 'Trapezius Decompress', 'Chair Squats', '20-20-20 Cognitive Reset'
    duration_seconds INTEGER NOT NULL DEFAULT 120,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Team & Organizational Challenges
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_metric_type TEXT NOT NULL CHECK (target_metric_type IN ('standing_minutes', 'break_count', 'sedentary_reduction_pct', 'steps')),
    target_goal_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Challenge Participants
CREATE TABLE IF NOT EXISTS public.challenge_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_progress_value INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_challenge UNIQUE (challenge_id, user_id)
);

-- 8. Social Chat & Role Modeling
CREATE TABLE IF NOT EXISTS public.social_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_content TEXT NOT NULL,
    posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- Indexes for High Performance Queries & Research Analytics
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_telemetry_user_time ON public.device_telemetry(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON public.device_telemetry(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_user_date ON public.daily_analytics(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_microbreak_user_completed ON public.microbreak_logs(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_chat_challenge_posted ON public.social_chat(challenge_id, posted_at ASC);

-- ====================================================================
-- Row Level Security (RLS) Helper Functions & Policies
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microbreak_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_chat ENABLE ROW LEVEL SECURITY;

-- Security Definer function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- RLS: Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS: Device Telemetry
CREATE POLICY "Users can view own telemetry; Admins view all"
  ON public.device_telemetry FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own telemetry"
  ON public.device_telemetry FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS: Daily Analytics
CREATE POLICY "Users can view own analytics; Admins view all"
  ON public.daily_analytics FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert or update own analytics"
  ON public.daily_analytics FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

-- RLS: Microbreak Logs
CREATE POLICY "Users can view own microbreaks; Admins view all"
  ON public.microbreak_logs FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own microbreaks"
  ON public.microbreak_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS: Challenges
CREATE POLICY "All authenticated users can view challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage challenges"
  ON public.challenges FOR ALL
  USING (public.is_admin());

-- RLS: Challenge Participants
CREATE POLICY "Users can view all participants"
  ON public.challenge_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join and update own progress"
  ON public.challenge_participants FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

-- RLS: Social Chat
CREATE POLICY "Users can view challenge chat"
  ON public.social_chat FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can post to challenge chat"
  ON public.social_chat FOR INSERT
  WITH CHECK (auth.uid() = user_id);
