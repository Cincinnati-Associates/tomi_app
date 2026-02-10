-- Migration: HomeBase - Post-Closing Home Management
-- Adds document management, task tracking, and RAG support for co-owners

-- Enable pgvector extension for embedding storage
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE "public"."document_category" AS ENUM(
  'ownership_agreement', 'insurance', 'financial', 'tax',
  'maintenance', 'legal', 'other'
);

CREATE TYPE "public"."document_status" AS ENUM(
  'uploading', 'processing', 'ready', 'error'
);

CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'done');

CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high');

-- =============================================================================
-- TABLES
-- =============================================================================

-- Home Documents: user-uploaded documents tied to a buying party
CREATE TABLE "home_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "party_id" uuid NOT NULL REFERENCES "buying_parties"("id") ON DELETE CASCADE,
  "uploaded_by" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "description" text,
  "category" "document_category" NOT NULL DEFAULT 'other',
  "status" "document_status" NOT NULL DEFAULT 'uploading',
  "file_path" text,
  "file_type" text,
  "file_size" integer,
  "text_content" text,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_home_documents_party_id" ON "home_documents"("party_id");
CREATE INDEX "idx_home_documents_category" ON "home_documents"("category");
CREATE INDEX "idx_home_documents_status" ON "home_documents"("status");
CREATE INDEX "idx_home_documents_uploaded_by" ON "home_documents"("uploaded_by");

-- Home Document Chunks: chunked text for RAG retrieval
CREATE TABLE "home_document_chunks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "document_id" uuid NOT NULL REFERENCES "home_documents"("id") ON DELETE CASCADE,
  "chunk_index" integer NOT NULL,
  "content" text NOT NULL,
  "embedding" vector(1536),
  "token_count" integer,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "home_document_chunks_doc_idx" ON "home_document_chunks"("document_id", "chunk_index");
CREATE INDEX "idx_home_document_chunks_document_id" ON "home_document_chunks"("document_id");

-- HNSW index for vector similarity search (better for small-medium datasets)
CREATE INDEX "idx_home_document_chunks_embedding" ON "home_document_chunks"
  USING hnsw ("embedding" vector_cosine_ops);

-- Home Tasks: tasks and projects for the home
CREATE TABLE "home_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "party_id" uuid NOT NULL REFERENCES "buying_parties"("id") ON DELETE CASCADE,
  "created_by" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "assigned_to" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "description" text,
  "status" "task_status" NOT NULL DEFAULT 'todo',
  "priority" "task_priority" NOT NULL DEFAULT 'medium',
  "due_date" date,
  "completed_at" timestamptz,
  "completed_by" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_home_tasks_party_id" ON "home_tasks"("party_id");
CREATE INDEX "idx_home_tasks_assigned_to" ON "home_tasks"("assigned_to");
CREATE INDEX "idx_home_tasks_status" ON "home_tasks"("status");
CREATE INDEX "idx_home_tasks_due_date" ON "home_tasks"("due_date");

-- Home Task Comments: notes/updates on tasks
CREATE TABLE "home_task_comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" uuid NOT NULL REFERENCES "home_tasks"("id") ON DELETE CASCADE,
  "author_id" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "content" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_home_task_comments_task_id" ON "home_task_comments"("task_id");

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE "home_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "home_document_chunks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "home_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "home_task_comments" ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is a member of a party
CREATE OR REPLACE FUNCTION is_party_member(p_party_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM party_members
    WHERE party_id = p_party_id
    AND user_id = p_user_id
    AND invite_status = 'accepted'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- home_documents policies
CREATE POLICY "Party members can view documents"
  ON "home_documents" FOR SELECT
  USING (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can insert documents"
  ON "home_documents" FOR INSERT
  WITH CHECK (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can update documents"
  ON "home_documents" FOR UPDATE
  USING (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can delete documents"
  ON "home_documents" FOR DELETE
  USING (is_party_member(party_id, auth.uid()));

-- home_document_chunks policies (access via document's party)
CREATE POLICY "Party members can view chunks"
  ON "home_document_chunks" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM home_documents d
    WHERE d.id = document_id
    AND is_party_member(d.party_id, auth.uid())
  ));

CREATE POLICY "Party members can insert chunks"
  ON "home_document_chunks" FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM home_documents d
    WHERE d.id = document_id
    AND is_party_member(d.party_id, auth.uid())
  ));

CREATE POLICY "Party members can delete chunks"
  ON "home_document_chunks" FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM home_documents d
    WHERE d.id = document_id
    AND is_party_member(d.party_id, auth.uid())
  ));

-- home_tasks policies
CREATE POLICY "Party members can view tasks"
  ON "home_tasks" FOR SELECT
  USING (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can insert tasks"
  ON "home_tasks" FOR INSERT
  WITH CHECK (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can update tasks"
  ON "home_tasks" FOR UPDATE
  USING (is_party_member(party_id, auth.uid()));

CREATE POLICY "Party members can delete tasks"
  ON "home_tasks" FOR DELETE
  USING (is_party_member(party_id, auth.uid()));

-- home_task_comments policies (access via task's party)
CREATE POLICY "Party members can view comments"
  ON "home_task_comments" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM home_tasks t
    WHERE t.id = task_id
    AND is_party_member(t.party_id, auth.uid())
  ));

CREATE POLICY "Party members can insert comments"
  ON "home_task_comments" FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM home_tasks t
    WHERE t.id = task_id
    AND is_party_member(t.party_id, auth.uid())
  ));

CREATE POLICY "Party members can delete own comments"
  ON "home_task_comments" FOR DELETE
  USING (author_id = auth.uid());

-- =============================================================================
-- STORAGE BUCKET
-- =============================================================================

-- Create private storage bucket for home documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'home-documents',
  'home-documents',
  false,
  20971520, -- 20MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp',
        'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: party members can upload/download from their party's folder
CREATE POLICY "Party members can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'home-documents'
    AND is_party_member((storage.foldername(name))[1]::uuid, auth.uid())
  );

CREATE POLICY "Party members can view documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'home-documents'
    AND is_party_member((storage.foldername(name))[1]::uuid, auth.uid())
  );

CREATE POLICY "Party members can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'home-documents'
    AND is_party_member((storage.foldername(name))[1]::uuid, auth.uid())
  );
