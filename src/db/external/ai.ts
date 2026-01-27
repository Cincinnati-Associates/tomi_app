import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
  unique,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// =============================================================================
// EXTERNAL TABLES - AI/RAG (n8n-owned)
// READ-ONLY: These tables are managed by n8n pipelines
// Do NOT modify these directly - they should only be updated after n8n changes
// =============================================================================

export const aiDocuments = pgTable(
  'ai_documents',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    sourceType: text('source_type').notNull(),
    sourceId: uuid('source_id'),
    title: text('title').notNull(),
    url: text('url'),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
    sourceUpdatedAt: timestamp('source_updated_at', {
      withTimezone: true,
      mode: 'string',
    }),
    contentSha256: text('content_sha256'),
    embeddingModel: text('embedding_model'),
    embeddingDim: integer('embedding_dim'),
    fileType: text('file_type'),
    testEnvironment: text('test_environment').default('production'),
  },
  (table) => [
    index('ai_documents_meta_idx').using('gin', table.metadata),
    index('ai_documents_source_idx').using(
      'btree',
      table.sourceType,
      table.sourceId
    ),
    index('idx_ai_documents_file_type').using('btree', table.fileType),
    index('idx_ai_documents_test_env').using('btree', table.testEnvironment),
    index('ix_ai_documents_sha').using('btree', table.contentSha256),
  ]
)

export const aiChunks = pgTable(
  'ai_chunks',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    documentId: uuid('document_id'),
    chunkIndex: integer('chunk_index'),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
    // embedding: vector(1536) - skipped (needs pgvector extension)
    metadata: jsonb('metadata').default({}).notNull(),
  },
  (table) => [
    index('ai_chunks_doc_idx').using(
      'btree',
      table.documentId,
      table.chunkIndex
    ),
    // embedding index skipped (needs pgvector)
    uniqueIndex('uq_ai_chunks_doc_idx').using(
      'btree',
      table.documentId,
      table.chunkIndex
    ),
    unique('ai_chunks_document_id_chunk_index_key').on(
      table.documentId,
      table.chunkIndex
    ),
  ]
)

// =============================================================================
// TYPES
// =============================================================================

export type AiDocument = typeof aiDocuments.$inferSelect
export type AiChunk = typeof aiChunks.$inferSelect
