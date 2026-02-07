-- Migration: Add admin role system
-- Adds user_role enum, role column to profiles, and admin audit event types

-- Create user_role enum
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'superadmin');

-- Add role column to profiles with default 'user' (existing users auto-populate)
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "role" "user_role" DEFAULT 'user' NOT NULL;

-- Add admin audit event types to existing auth_event_type enum
ALTER TYPE "public"."auth_event_type" ADD VALUE IF NOT EXISTS 'admin.role_changed';
ALTER TYPE "public"."auth_event_type" ADD VALUE IF NOT EXISTS 'admin.password_reset_sent';
ALTER TYPE "public"."auth_event_type" ADD VALUE IF NOT EXISTS 'admin.exercise_reset';
ALTER TYPE "public"."auth_event_type" ADD VALUE IF NOT EXISTS 'admin.member_removed';
ALTER TYPE "public"."auth_event_type" ADD VALUE IF NOT EXISTS 'admin.party_status_changed';
