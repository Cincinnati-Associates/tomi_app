-- Migration: Group Chat — Multi-User Homi Chat for Co-Buying Parties
-- Adds group conversations, messages, and conversation members tables

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE "public"."group_message_role" AS ENUM('user', 'assistant', 'system');
CREATE TYPE "public"."message_channel" AS ENUM('app', 'imessage', 'whatsapp', 'telegram', 'signal');

-- =============================================================================
-- TABLES
-- =============================================================================

-- Group Conversations: one main conversation per party (V1), threads via parent (V2)
CREATE TABLE "group_conversations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "party_id" uuid NOT NULL REFERENCES "buying_parties"("id") ON DELETE CASCADE,
  "parent_conversation_id" uuid REFERENCES "group_conversations"("id") ON DELETE SET NULL,
  "title" text NOT NULL DEFAULT 'Main Chat',
  "custom_instructions" text,
  "channels" jsonb DEFAULT '["app"]',
  "message_count" integer NOT NULL DEFAULT 0,
  "last_message_at" timestamptz,
  "last_message_preview" text,
  "last_message_sender_id" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_group_conversations_party_id" ON "group_conversations"("party_id");

-- Enforce one main conversation per party (where parent_conversation_id IS NULL)
CREATE UNIQUE INDEX "uq_group_conversations_main_per_party"
  ON "group_conversations"("party_id")
  WHERE "parent_conversation_id" IS NULL;

-- Group Messages: all messages in a conversation
CREATE TABLE "group_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversation_id" uuid NOT NULL REFERENCES "group_conversations"("id") ON DELETE CASCADE,
  "sender_id" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "role" "group_message_role" NOT NULL,
  "content" text NOT NULL,
  "channel" "message_channel" NOT NULL DEFAULT 'app',
  "external_id" text,
  "channel_metadata" jsonb,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_group_messages_conversation_created"
  ON "group_messages"("conversation_id", "created_at" DESC);
CREATE INDEX "idx_group_messages_sender_id" ON "group_messages"("sender_id");

-- Group Conversation Members: who's in each conversation + read cursors
CREATE TABLE "group_conversation_members" (
  "conversation_id" uuid NOT NULL REFERENCES "group_conversations"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "last_read_message_id" uuid REFERENCES "group_messages"("id") ON DELETE SET NULL,
  "last_read_at" timestamptz,
  "muted_until" timestamptz,
  "joined_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("conversation_id", "user_id")
);

-- =============================================================================
-- EXERCISE MULTI-COMPLETION SUPPORT
-- =============================================================================

-- Add target_user_id for per-member exercises (e.g., Co-Buyer Check-In per co-buyer)
ALTER TABLE "user_exercise_responses"
  ADD COLUMN IF NOT EXISTS "target_user_id" uuid REFERENCES "profiles"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "idx_user_exercise_responses_target_user"
  ON "user_exercise_responses"("target_user_id");

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE "group_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "group_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "group_conversation_members" ENABLE ROW LEVEL SECURITY;

-- group_conversations policies
CREATE POLICY "Party members can view group conversations"
  ON "group_conversations" FOR SELECT
  USING (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can insert group conversations"
  ON "group_conversations" FOR INSERT
  WITH CHECK (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can update group conversations"
  ON "group_conversations" FOR UPDATE
  USING (is_party_member(party_id, auth.uid()));

-- group_messages policies
CREATE POLICY "Party members can view group messages"
  ON "group_messages" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM group_conversations gc
    WHERE gc.id = conversation_id
    AND is_party_member(gc.party_id, auth.uid())
  ));

CREATE POLICY "Party members can insert group messages"
  ON "group_messages" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_conversations gc
      WHERE gc.id = conversation_id
      AND is_party_member(gc.party_id, auth.uid())
    )
    AND (sender_id IS NULL OR sender_id = auth.uid())
  );

-- group_conversation_members policies
CREATE POLICY "Party members can view conversation members"
  ON "group_conversation_members" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM group_conversations gc
    WHERE gc.id = conversation_id
    AND is_party_member(gc.party_id, auth.uid())
  ));

CREATE POLICY "Party members can insert conversation members"
  ON "group_conversation_members" FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM group_conversations gc
    WHERE gc.id = conversation_id
    AND is_party_member(gc.party_id, auth.uid())
  ));

CREATE POLICY "Members can update own read cursor"
  ON "group_conversation_members" FOR UPDATE
  USING (user_id = auth.uid());

-- =============================================================================
-- ENABLE REALTIME
-- =============================================================================

-- Enable Supabase Realtime on group_messages for live message delivery
ALTER PUBLICATION supabase_realtime ADD TABLE "group_messages";
