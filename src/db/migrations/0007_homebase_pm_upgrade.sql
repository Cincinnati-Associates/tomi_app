-- =============================================================================
-- 0007: HomeBase PM Upgrade — Labels, Subtasks, Activity, Ownership
-- Adds label system, subtask support, activity audit trail, project ownership,
-- and additional task fields (start_date, estimated_minutes, sort_order).
-- =============================================================================

-- =============================================================================
-- LABELS
-- =============================================================================

CREATE TABLE "home_labels" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "party_id" uuid NOT NULL REFERENCES "buying_parties"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "color" text NOT NULL DEFAULT '#6B7280',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_home_labels_party_id" ON "home_labels"("party_id");
CREATE UNIQUE INDEX "idx_home_labels_party_name" ON "home_labels"("party_id", lower("name"));

-- Junction table: tasks ↔ labels (many-to-many)
CREATE TABLE "home_task_labels" (
  "task_id" uuid NOT NULL REFERENCES "home_tasks"("id") ON DELETE CASCADE,
  "label_id" uuid NOT NULL REFERENCES "home_labels"("id") ON DELETE CASCADE,
  PRIMARY KEY ("task_id", "label_id")
);

CREATE INDEX "idx_home_task_labels_label_id" ON "home_task_labels"("label_id");

-- =============================================================================
-- SUBTASKS + TASK FIELDS
-- =============================================================================

-- Self-referential FK: a task can have a parent task (subtask support)
ALTER TABLE "home_tasks" ADD COLUMN "parent_task_id" uuid REFERENCES "home_tasks"("id") ON DELETE CASCADE;
CREATE INDEX "idx_home_tasks_parent_task_id" ON "home_tasks"("parent_task_id");

-- Manual ordering within a project or parent task
ALTER TABLE "home_tasks" ADD COLUMN "sort_order" integer NOT NULL DEFAULT 0;
CREATE INDEX "idx_home_tasks_sort_order" ON "home_tasks"("sort_order");

-- Start date (when work should begin, distinct from due date)
ALTER TABLE "home_tasks" ADD COLUMN "start_date" date;

-- Estimated effort in minutes
ALTER TABLE "home_tasks" ADD COLUMN "estimated_minutes" integer;

-- =============================================================================
-- PROJECT OWNERSHIP
-- =============================================================================

-- The person responsible for driving this project (distinct from created_by)
ALTER TABLE "home_projects" ADD COLUMN "owner_id" uuid REFERENCES "profiles"("id") ON DELETE SET NULL;

-- Default owner_id to created_by for existing projects
UPDATE "home_projects" SET "owner_id" = "created_by" WHERE "owner_id" IS NULL;

-- =============================================================================
-- ACTIVITY / AUDIT TRAIL
-- =============================================================================

CREATE TABLE "home_task_activity" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" uuid NOT NULL REFERENCES "home_tasks"("id") ON DELETE CASCADE,
  "actor_id" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "actor_type" text NOT NULL DEFAULT 'user',  -- 'user' = direct edit, 'ai' = Homi on user's behalf
  "action" text NOT NULL,       -- 'created', 'status_changed', 'priority_changed', 'assigned', 'label_added', 'label_removed', 'moved_to_project', 'comment_added', etc.
  "field_name" text,            -- 'status', 'priority', 'assigned_to', 'due_date', 'project_id', etc.
  "old_value" text,
  "new_value" text,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_home_task_activity_task_id" ON "home_task_activity"("task_id");
CREATE INDEX "idx_home_task_activity_created_at" ON "home_task_activity"("created_at");

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- home_labels
ALTER TABLE "home_labels" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Party members can view labels"
  ON "home_labels" FOR SELECT
  USING (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can insert labels"
  ON "home_labels" FOR INSERT
  WITH CHECK (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can update labels"
  ON "home_labels" FOR UPDATE
  USING (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can delete labels"
  ON "home_labels" FOR DELETE
  USING (is_party_member(party_id, auth.uid()));

-- home_task_labels (access via task's party)
ALTER TABLE "home_task_labels" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Party members can view task labels"
  ON "home_task_labels" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM home_tasks t WHERE t.id = task_id AND is_party_member(t.party_id, auth.uid())
  ));

CREATE POLICY "Party members can add task labels"
  ON "home_task_labels" FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM home_tasks t WHERE t.id = task_id AND is_party_member(t.party_id, auth.uid())
  ));

CREATE POLICY "Party members can remove task labels"
  ON "home_task_labels" FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM home_tasks t WHERE t.id = task_id AND is_party_member(t.party_id, auth.uid())
  ));

-- home_task_activity (access via task's party)
ALTER TABLE "home_task_activity" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Party members can view task activity"
  ON "home_task_activity" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM home_tasks t WHERE t.id = task_id AND is_party_member(t.party_id, auth.uid())
  ));

CREATE POLICY "Party members can insert task activity"
  ON "home_task_activity" FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM home_tasks t WHERE t.id = task_id AND is_party_member(t.party_id, auth.uid())
  ));
