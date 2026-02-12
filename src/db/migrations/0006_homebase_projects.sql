-- =============================================================================
-- 0006: Add Projects to HomeBase
-- Adds home_projects table and project_id FK to home_tasks.
-- =============================================================================

-- Project status enum
CREATE TYPE "public"."project_status" AS ENUM('active', 'completed', 'archived');

-- =============================================================================
-- HOME PROJECTS TABLE
-- =============================================================================

CREATE TABLE "home_projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "party_id" uuid NOT NULL REFERENCES "buying_parties"("id") ON DELETE CASCADE,
  "created_by" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "name" text NOT NULL,
  "description" text,
  "color" text NOT NULL DEFAULT '#6B7280',
  "icon" text DEFAULT 'folder',
  "status" "project_status" NOT NULL DEFAULT 'active',
  "sort_order" integer NOT NULL DEFAULT 0,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_home_projects_party_id" ON "home_projects"("party_id");
CREATE INDEX "idx_home_projects_status" ON "home_projects"("status");

-- =============================================================================
-- ADD PROJECT REFERENCE TO TASKS
-- =============================================================================

ALTER TABLE "home_tasks" ADD COLUMN "project_id" uuid REFERENCES "home_projects"("id") ON DELETE SET NULL;
CREATE INDEX "idx_home_tasks_project_id" ON "home_tasks"("project_id");

-- =============================================================================
-- ROW LEVEL SECURITY FOR PROJECTS
-- =============================================================================

ALTER TABLE "home_projects" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Party members can view projects"
  ON "home_projects" FOR SELECT
  USING (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can insert projects"
  ON "home_projects" FOR INSERT
  WITH CHECK (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can update projects"
  ON "home_projects" FOR UPDATE
  USING (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can delete projects"
  ON "home_projects" FOR DELETE
  USING (is_party_member(party_id, auth.uid()));
