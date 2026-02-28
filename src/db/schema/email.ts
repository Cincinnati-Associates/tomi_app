import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

// =============================================================================
// EMAIL ENUMS
// =============================================================================

export const emailSendStatusEnum = pgEnum('email_send_status', [
  'pending',
  'sent',
  'failed',
  'skipped',
  'bounced',
  'delivered',
  'opened',
  'clicked',
])

export const emailSequenceStatusEnum = pgEnum('email_sequence_status', [
  'scheduled',
  'sent',
  'cancelled',
  'skipped',
])

// =============================================================================
// EMAIL SENDS — Audit log for every send attempt
// =============================================================================

export const emailSends = pgTable(
  'email_sends',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    emailType: varchar('email_type', { length: 100 }).notNull(),
    toAddress: varchar('to_address', { length: 255 }).notNull(),
    fromAddress: varchar('from_address', { length: 255 }).notNull(),
    subject: text('subject').notNull(),
    userId: uuid('user_id').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    leadEmail: varchar('lead_email', { length: 255 }),
    status: emailSendStatusEnum('status').notNull().default('pending'),
    resendId: varchar('resend_id', { length: 255 }),
    errorMessage: text('error_message'),
    idempotencyKey: varchar('idempotency_key', { length: 255 }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_email_sends_type').on(table.emailType),
    index('idx_email_sends_to').on(table.toAddress),
    index('idx_email_sends_user').on(table.userId),
    index('idx_email_sends_status').on(table.status),
    index('idx_email_sends_resend_id').on(table.resendId),
    uniqueIndex('idx_email_sends_idempotency').on(table.idempotencyKey),
    index('idx_email_sends_created').on(table.createdAt),
  ]
)

// =============================================================================
// EMAIL SEQUENCES — Scheduled/drip emails
// =============================================================================

export const emailSequences = pgTable(
  'email_sequences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    emailType: varchar('email_type', { length: 100 }).notNull(),
    toAddress: varchar('to_address', { length: 255 }).notNull(),
    userId: uuid('user_id').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    leadEmail: varchar('lead_email', { length: 255 }),
    scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
    status: emailSequenceStatusEnum('status').notNull().default('scheduled'),
    cancelCondition: jsonb('cancel_condition'),
    templateData: jsonb('template_data'),
    emailSendId: uuid('email_send_id').references(() => emailSends.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_email_sequences_type').on(table.emailType),
    index('idx_email_sequences_status').on(table.status),
    index('idx_email_sequences_scheduled').on(table.scheduledFor),
    index('idx_email_sequences_to').on(table.toAddress),
    index('idx_email_sequences_user').on(table.userId),
  ]
)

// =============================================================================
// TYPES
// =============================================================================

export type EmailSend = typeof emailSends.$inferSelect
export type NewEmailSend = typeof emailSends.$inferInsert
export type EmailSequence = typeof emailSequences.$inferSelect
export type NewEmailSequence = typeof emailSequences.$inferInsert
