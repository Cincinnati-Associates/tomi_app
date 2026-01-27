import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  date,
  jsonb,
  bigint,
  index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// =============================================================================
// EXTERNAL TABLES - OPERATIONS (n8n-owned)
// READ-ONLY: These tables are managed by n8n pipelines
// Do NOT modify these directly - they should only be updated after n8n changes
// =============================================================================

/**
 * N8N's audit log (different from app's auth_audit_logs)
 * Tracks general system changes from n8n pipelines
 */
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id')
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  tableName: text('table_name').notNull(),
  recordId: uuid('record_id').notNull(),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  changedBy: text('changed_by').default('system'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
})

export const expenseReviewQueue = pgTable(
  'expense_review_queue',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    financialTransactionId: uuid('financial_transaction_id'),
    merchant: text('merchant'),
    amount: numeric('amount'),
    txDate: date('tx_date'),
    suggestedCategories: jsonb('suggested_categories'),
    status: text('status').default('pending'),
    telegramMessageId: text('telegram_message_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  () => []
)

export const expenseReviewState = pgTable('expense_review_state', {
  telegramUserId: bigint('telegram_user_id', { mode: 'number' })
    .primaryKey()
    .notNull(),
  currentReviewId: uuid('current_review_id'),
  awaitingCategory: boolean('awaiting_category').default(false),
  lastMessageId: bigint('last_message_id', { mode: 'number' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
})

export const manualReviewQueue = pgTable(
  'manual_review_queue',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    fileId: text('file_id').notNull(),
    fileName: text('file_name').notNull(),
    reason: text('reason').notNull(),
    status: text('status').default('pending'),
    data: jsonb('data'),
    reviewerNotes: text('reviewer_notes'),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    merchant: text('merchant'),
    description: text('description'),
    amount: numeric('amount', { precision: 10, scale: 2 }),
    txDate: date('tx_date'),
    testEnvironment: text('test_environment'),
  },
  (table) => [
    index('idx_review_queue_created_at').using('btree', table.createdAt),
    index('idx_review_queue_status').using('btree', table.status),
  ]
)

// =============================================================================
// TYPES
// =============================================================================

export type AuditLog = typeof auditLogs.$inferSelect
export type ExpenseReviewQueueItem = typeof expenseReviewQueue.$inferSelect
export type ExpenseReviewStateItem = typeof expenseReviewState.$inferSelect
export type ManualReviewQueueItem = typeof manualReviewQueue.$inferSelect
