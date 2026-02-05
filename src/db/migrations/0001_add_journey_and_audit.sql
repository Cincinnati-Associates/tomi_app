-- Migration: Add Journey System and Auth Audit tables
-- PRD-001: Auth Audit Logs
-- PRD-002: Personal Journey (user_journeys, exercise_templates, user_exercise_responses)

-- New enums
CREATE TYPE "public"."auth_event_type" AS ENUM('user.registered', 'user.login', 'user.logout', 'user.password_reset', 'user.profile_updated', 'user.email_verified');
CREATE TYPE "public"."journey_stage" AS ENUM('exploring', 'educating', 'preparing', 'ready', 'in_group', 'owner');
CREATE TYPE "public"."exercise_category" AS ENUM('individual', 'group', 'hybrid');
CREATE TYPE "public"."exercise_status" AS ENUM('in_progress', 'completed');
CREATE TYPE "public"."visitor_stage" AS ENUM('explorer', 'evaluator', 'ready', 'calculated');
CREATE TYPE "public"."chat_role" AS ENUM('user', 'assistant', 'system');

-- Add timezone column to profiles (PRD-001)
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "timezone" varchar(50) DEFAULT 'UTC';

-- User Journeys (PRD-002)
CREATE TABLE IF NOT EXISTS "user_journeys" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL UNIQUE REFERENCES "profiles"("id") ON DELETE CASCADE,
    "stage" "journey_stage" DEFAULT 'exploring' NOT NULL,
    "readiness_score" integer DEFAULT 0,
    "target_timeline" varchar(50),
    "target_markets" jsonb DEFAULT '[]',
    "budget_range_low" integer,
    "budget_range_high" integer,
    "co_buyer_status" varchar(50),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_user_journeys_stage" ON "user_journeys" ("stage");
CREATE INDEX IF NOT EXISTS "idx_user_journeys_readiness" ON "user_journeys" ("readiness_score");

-- Exercise Templates (PRD-002/003)
CREATE TABLE IF NOT EXISTS "exercise_templates" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "slug" varchar(100) NOT NULL UNIQUE,
    "name" varchar(255) NOT NULL,
    "description" text,
    "category" "exercise_category" NOT NULL,
    "journey_stages" jsonb DEFAULT '[]' NOT NULL,
    "schema" jsonb NOT NULL,
    "scoring_rules" jsonb,
    "display_order" integer DEFAULT 0,
    "is_required" boolean DEFAULT false NOT NULL,
    "estimated_minutes" integer,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_exercise_templates_slug" ON "exercise_templates" ("slug");
CREATE INDEX IF NOT EXISTS "idx_exercise_templates_category" ON "exercise_templates" ("category");
CREATE INDEX IF NOT EXISTS "idx_exercise_templates_active" ON "exercise_templates" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_exercise_templates_order" ON "exercise_templates" ("display_order");

-- User Exercise Responses (PRD-002)
CREATE TABLE IF NOT EXISTS "user_exercise_responses" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "exercise_id" uuid NOT NULL REFERENCES "exercise_templates"("id") ON DELETE CASCADE,
    "group_id" uuid REFERENCES "buying_parties"("id") ON DELETE SET NULL,
    "responses" jsonb DEFAULT '{}' NOT NULL,
    "computed_scores" jsonb DEFAULT '{}',
    "status" "exercise_status" DEFAULT 'in_progress' NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "version" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE("user_id", "exercise_id", "version")
);

CREATE INDEX IF NOT EXISTS "idx_user_exercise_responses_user" ON "user_exercise_responses" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_exercise_responses_exercise" ON "user_exercise_responses" ("exercise_id");
CREATE INDEX IF NOT EXISTS "idx_user_exercise_responses_group" ON "user_exercise_responses" ("group_id");
CREATE INDEX IF NOT EXISTS "idx_user_exercise_responses_status" ON "user_exercise_responses" ("status");

-- Visitor Sessions
CREATE TABLE IF NOT EXISTS "visitor_sessions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "visitor_id" uuid NOT NULL,
    "session_id" uuid NOT NULL,
    "first_name" text,
    "identity_confirmed" boolean DEFAULT false,
    "stage" "visitor_stage" DEFAULT 'explorer' NOT NULL,
    "volunteered_info" jsonb DEFAULT '{}',
    "behavior" jsonb DEFAULT '{}',
    "chat_summary" text,
    "chat_topics" text[],
    "chat_sentiment" text,
    "qualification_signals" jsonb DEFAULT '{}',
    "first_seen" timestamp with time zone DEFAULT now() NOT NULL,
    "last_seen" timestamp with time zone DEFAULT now() NOT NULL,
    "linked_user_id" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
    "linked_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_visitor_sessions_visitor_id" ON "visitor_sessions" ("visitor_id");
CREATE INDEX IF NOT EXISTS "idx_visitor_sessions_linked_user" ON "visitor_sessions" ("linked_user_id");
CREATE INDEX IF NOT EXISTS "idx_visitor_sessions_stage" ON "visitor_sessions" ("stage");
CREATE INDEX IF NOT EXISTS "idx_visitor_sessions_last_seen" ON "visitor_sessions" ("last_seen");

-- Chat Conversations
CREATE TABLE IF NOT EXISTS "chat_conversations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "party_id" uuid REFERENCES "buying_parties"("id") ON DELETE SET NULL,
    "title" text,
    "started_at" timestamp with time zone DEFAULT now() NOT NULL,
    "last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
    "message_count" integer DEFAULT 0 NOT NULL,
    "topics_discussed" text[],
    "sentiment" text,
    "summary" text,
    "is_archived" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_chat_conversations_user_id" ON "chat_conversations" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_chat_conversations_party_id" ON "chat_conversations" ("party_id");
CREATE INDEX IF NOT EXISTS "idx_chat_conversations_last_message" ON "chat_conversations" ("last_message_at");

-- Chat Messages
CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "conversation_id" uuid NOT NULL REFERENCES "chat_conversations"("id") ON DELETE CASCADE,
    "role" "chat_role" NOT NULL,
    "content" text NOT NULL,
    "metadata" jsonb DEFAULT '{}',
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_chat_messages_conversation_id" ON "chat_messages" ("conversation_id");
CREATE INDEX IF NOT EXISTS "idx_chat_messages_created_at" ON "chat_messages" ("created_at");

-- Visitor User Links
CREATE TABLE IF NOT EXISTS "visitor_user_links" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "visitor_id" uuid NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "merged_context" jsonb,
    "linked_at" timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE("visitor_id", "user_id")
);

CREATE INDEX IF NOT EXISTS "idx_visitor_user_links_visitor" ON "visitor_user_links" ("visitor_id");
CREATE INDEX IF NOT EXISTS "idx_visitor_user_links_user" ON "visitor_user_links" ("user_id");

-- Auth Audit Logs (PRD-001)
CREATE TABLE IF NOT EXISTS "auth_audit_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "event_type" "auth_event_type" NOT NULL,
    "user_id" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
    "email" varchar(255),
    "ip_address" varchar(45),
    "user_agent" text,
    "metadata" jsonb DEFAULT '{}',
    "retention_days" integer,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_auth_audit_logs_event_type" ON "auth_audit_logs" ("event_type");
CREATE INDEX IF NOT EXISTS "idx_auth_audit_logs_user_id" ON "auth_audit_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_auth_audit_logs_created_at" ON "auth_audit_logs" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_auth_audit_logs_email" ON "auth_audit_logs" ("email");
