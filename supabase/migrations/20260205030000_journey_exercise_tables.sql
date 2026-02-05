-- ============================================
-- JOURNEY & EXERCISE SYSTEM (PRD-002, PRD-003)
-- Creates user_journeys, exercise_templates, and
-- user_exercise_responses tables.
-- These were previously defined only in Drizzle
-- schema (src/db/schema/journey.ts) but never
-- created in Supabase.
-- ============================================

-- Enums
CREATE TYPE public.journey_stage AS ENUM (
  'exploring',
  'educating',
  'preparing',
  'ready',
  'in_group',
  'owner'
);

CREATE TYPE public.exercise_category AS ENUM (
  'individual',
  'group',
  'hybrid'
);

CREATE TYPE public.exercise_status AS ENUM (
  'in_progress',
  'completed'
);

-- ============================================
-- USER JOURNEYS
-- 1:1 with profiles. Tracks stage, readiness,
-- and preferences for co-ownership.
-- ============================================
CREATE TABLE public.user_journeys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Journey stage
  stage public.journey_stage DEFAULT 'exploring' NOT NULL,

  -- Readiness assessment (0-100)
  readiness_score integer DEFAULT 0,

  -- Timeline & preferences
  target_timeline varchar(50),
  target_markets jsonb DEFAULT '[]'::jsonb,
  budget_range_low integer,
  budget_range_high integer,
  co_buyer_status varchar(50),

  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_user_journeys_stage ON public.user_journeys(stage);
CREATE INDEX idx_user_journeys_readiness ON public.user_journeys(readiness_score);

-- ============================================
-- EXERCISE TEMPLATES
-- Schema-driven exercise definitions rendered
-- dynamically by frontend. No per-exercise code.
-- ============================================
CREATE TABLE public.exercise_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug varchar(100) NOT NULL UNIQUE,

  -- Display info
  name varchar(255) NOT NULL,
  description text,

  -- Categorization
  category public.exercise_category NOT NULL,

  -- Applicable journey stages (array of stage values)
  journey_stages jsonb DEFAULT '[]'::jsonb NOT NULL,

  -- JSON Schema for questions (PRD-003 format)
  schema jsonb NOT NULL,

  -- Scoring configuration
  scoring_rules jsonb,

  -- Display & requirements
  display_order integer DEFAULT 0,
  is_required boolean DEFAULT false NOT NULL,
  estimated_minutes integer,
  is_active boolean DEFAULT true NOT NULL,

  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_exercise_templates_slug ON public.exercise_templates(slug);
CREATE INDEX idx_exercise_templates_category ON public.exercise_templates(category);
CREATE INDEX idx_exercise_templates_active ON public.exercise_templates(is_active);
CREATE INDEX idx_exercise_templates_order ON public.exercise_templates(display_order);

-- ============================================
-- USER EXERCISE RESPONSES
-- User's answers to exercises with versioning
-- for retakes.
-- ============================================
CREATE TABLE public.user_exercise_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES public.exercise_templates(id) ON DELETE CASCADE NOT NULL,

  -- Optional group context for hybrid exercises
  group_id uuid REFERENCES public.buying_parties(id) ON DELETE SET NULL,

  -- Response data
  responses jsonb DEFAULT '{}'::jsonb NOT NULL,
  computed_scores jsonb DEFAULT '{}'::jsonb,

  -- Status
  status public.exercise_status DEFAULT 'in_progress' NOT NULL,

  -- Timestamps
  started_at timestamptz,
  completed_at timestamptz,

  -- Versioning for retakes
  version integer DEFAULT 1 NOT NULL,

  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Unique constraint: one response per user/exercise/version
  CONSTRAINT user_exercise_responses_user_exercise_version UNIQUE (user_id, exercise_id, version)
);

CREATE INDEX idx_user_exercise_responses_user ON public.user_exercise_responses(user_id);
CREATE INDEX idx_user_exercise_responses_exercise ON public.user_exercise_responses(exercise_id);
CREATE INDEX idx_user_exercise_responses_group ON public.user_exercise_responses(group_id);
CREATE INDEX idx_user_exercise_responses_status ON public.user_exercise_responses(status);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Exercise templates: read-only for all authenticated users
ALTER TABLE public.exercise_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active templates" ON public.exercise_templates
  FOR SELECT USING (is_active = true);

-- User journeys: users can only manage their own
ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own journey" ON public.user_journeys
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journey" ON public.user_journeys
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journey" ON public.user_journeys
  FOR UPDATE USING (auth.uid() = user_id);

-- User exercise responses: users can only manage their own
ALTER TABLE public.user_exercise_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own responses" ON public.user_exercise_responses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own responses" ON public.user_exercise_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own responses" ON public.user_exercise_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- GRANT TABLE PERMISSIONS (ADR-008)
-- ============================================
GRANT SELECT ON public.exercise_templates TO authenticated;
GRANT ALL ON public.exercise_templates TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.user_journeys TO authenticated;
GRANT ALL ON public.user_journeys TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.user_exercise_responses TO authenticated;
GRANT ALL ON public.user_exercise_responses TO service_role;
