-- Migration: Add auto-incrementing task numbers per party
-- Task numbers are human-readable IDs (T-1, T-2, etc.) scoped per party.

-- Add task_number column (nullable initially so we can backfill)
ALTER TABLE home_tasks ADD COLUMN task_number integer;

-- Backfill existing tasks with sequential numbers per party
WITH numbered AS (
  SELECT id, party_id,
         ROW_NUMBER() OVER (PARTITION BY party_id ORDER BY created_at ASC) AS rn
  FROM home_tasks
)
UPDATE home_tasks
SET task_number = numbered.rn
FROM numbered
WHERE home_tasks.id = numbered.id;

-- Now make it NOT NULL
ALTER TABLE home_tasks ALTER COLUMN task_number SET NOT NULL;

-- Unique constraint: no duplicate task numbers within a party
CREATE UNIQUE INDEX idx_home_tasks_party_task_number ON home_tasks (party_id, task_number);

-- Add project code column to home_projects (short prefix for task IDs, e.g. "ADU", "INS")
ALTER TABLE home_projects ADD COLUMN code text;

-- Create index on project code for lookups
CREATE INDEX idx_home_projects_code ON home_projects (party_id, code);
