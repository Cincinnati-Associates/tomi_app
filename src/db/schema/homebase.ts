import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  date,
  index,
  unique,
  customType,
} from 'drizzle-orm/pg-core'
import {
  documentCategoryEnum,
  documentStatusEnum,
  taskStatusEnum,
  taskPriorityEnum,
  projectStatusEnum,
} from './enums'
import { profiles } from './profiles'
import { buyingParties } from './parties'

// Custom pgvector type for embeddings
const vector = customType<{ data: number[]; driverParam: string }>({
  dataType() {
    return 'vector(1536)'
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`
  },
  fromDriver(value: unknown): number[] {
    // Parse "[0.1,0.2,...]" format from postgres
    const str = String(value)
    return str
      .slice(1, -1)
      .split(',')
      .map(Number)
  },
})

// =============================================================================
// HOME DOCUMENTS
// =============================================================================

export const homeDocuments = pgTable(
  'home_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partyId: uuid('party_id')
      .references(() => buyingParties.id, { onDelete: 'cascade' })
      .notNull(),
    uploadedBy: uuid('uploaded_by')
      .references(() => profiles.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    category: documentCategoryEnum('category').default('other').notNull(),
    status: documentStatusEnum('status').default('uploading').notNull(),
    filePath: text('file_path'),
    fileType: text('file_type'),
    fileSize: integer('file_size'),
    textContent: text('text_content'),
    metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_home_documents_party_id').on(table.partyId),
    index('idx_home_documents_category').on(table.category),
    index('idx_home_documents_status').on(table.status),
    index('idx_home_documents_uploaded_by').on(table.uploadedBy),
  ]
)

// =============================================================================
// HOME DOCUMENT CHUNKS (for RAG)
// =============================================================================

export const homeDocumentChunks = pgTable(
  'home_document_chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .references(() => homeDocuments.id, { onDelete: 'cascade' })
      .notNull(),
    chunkIndex: integer('chunk_index').notNull(),
    content: text('content').notNull(),
    embedding: vector('embedding'),
    tokenCount: integer('token_count'),
    metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('home_document_chunks_doc_idx').on(table.documentId, table.chunkIndex),
    index('idx_home_document_chunks_document_id').on(table.documentId),
  ]
)

// =============================================================================
// HOME PROJECTS
// =============================================================================

export const homeProjects = pgTable(
  'home_projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partyId: uuid('party_id')
      .references(() => buyingParties.id, { onDelete: 'cascade' })
      .notNull(),
    createdBy: uuid('created_by')
      .references(() => profiles.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    description: text('description'),
    color: text('color').notNull().default('#6B7280'),
    icon: text('icon').default('folder'),
    status: projectStatusEnum('status').default('active').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_home_projects_party_id').on(table.partyId),
    index('idx_home_projects_status').on(table.status),
  ]
)

// =============================================================================
// HOME TASKS
// =============================================================================

export const homeTasks = pgTable(
  'home_tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partyId: uuid('party_id')
      .references(() => buyingParties.id, { onDelete: 'cascade' })
      .notNull(),
    projectId: uuid('project_id')
      .references(() => homeProjects.id, { onDelete: 'set null' }),
    createdBy: uuid('created_by')
      .references(() => profiles.id, { onDelete: 'set null' }),
    assignedTo: uuid('assigned_to')
      .references(() => profiles.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    status: taskStatusEnum('status').default('todo').notNull(),
    priority: taskPriorityEnum('priority').default('medium').notNull(),
    dueDate: date('due_date'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    completedBy: uuid('completed_by')
      .references(() => profiles.id, { onDelete: 'set null' }),
    metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_home_tasks_party_id').on(table.partyId),
    index('idx_home_tasks_project_id').on(table.projectId),
    index('idx_home_tasks_assigned_to').on(table.assignedTo),
    index('idx_home_tasks_status').on(table.status),
    index('idx_home_tasks_due_date').on(table.dueDate),
  ]
)

// =============================================================================
// HOME TASK COMMENTS
// =============================================================================

export const homeTaskComments = pgTable(
  'home_task_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id')
      .references(() => homeTasks.id, { onDelete: 'cascade' })
      .notNull(),
    authorId: uuid('author_id')
      .references(() => profiles.id, { onDelete: 'set null' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_home_task_comments_task_id').on(table.taskId),
  ]
)

// =============================================================================
// TYPES
// =============================================================================

export type HomeDocument = typeof homeDocuments.$inferSelect
export type NewHomeDocument = typeof homeDocuments.$inferInsert
export type HomeDocumentChunk = typeof homeDocumentChunks.$inferSelect
export type NewHomeDocumentChunk = typeof homeDocumentChunks.$inferInsert
export type HomeProject = typeof homeProjects.$inferSelect
export type NewHomeProject = typeof homeProjects.$inferInsert
export type HomeTask = typeof homeTasks.$inferSelect
export type NewHomeTask = typeof homeTasks.$inferInsert
export type HomeTaskComment = typeof homeTaskComments.$inferSelect
export type NewHomeTaskComment = typeof homeTaskComments.$inferInsert
