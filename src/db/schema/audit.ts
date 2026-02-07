import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  varchar,
  integer,
  index,
} from 'drizzle-orm/pg-core'
import { authEventTypeEnum } from './enums'
import { profiles } from './profiles'

// =============================================================================
// AUTH AUDIT LOGS (PRD-001 §4.2)
// Tracks authentication events for SOC2/ISO27001 compliance
// =============================================================================

/**
 * Authentication Audit Log
 *
 * Records auth events for compliance and security monitoring.
 *
 * Retention Policy (PRD-001 §4.2):
 * - 7 years: user.registered, user.password_reset (compliance events)
 * - 90 days: user.login, user.logout, user.profile_updated (operational events)
 *
 * Note: Retention enforcement should be handled via scheduled function.
 */
export const authAuditLogs = pgTable(
  'auth_audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Event type (determines retention)
    eventType: authEventTypeEnum('event_type').notNull(),

    // User reference (nullable for pre-registration events)
    userId: uuid('user_id').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    email: varchar('email', { length: 255 }),

    // Request context
    ipAddress: varchar('ip_address', { length: 45 }), // IPv6 compatible
    userAgent: text('user_agent'),

    // Additional event-specific data
    metadata: jsonb('metadata').default({}), // changed_fields, session_id, etc.

    // Retention tracking
    retentionDays: integer('retention_days'), // 90 or 2555 (7 years)

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_auth_audit_logs_event_type').on(table.eventType),
    index('idx_auth_audit_logs_user_id').on(table.userId),
    index('idx_auth_audit_logs_created_at').on(table.createdAt),
    index('idx_auth_audit_logs_email').on(table.email),
  ]
)

// =============================================================================
// TYPES
// =============================================================================

export type AuthAuditLog = typeof authAuditLogs.$inferSelect
export type NewAuthAuditLog = typeof authAuditLogs.$inferInsert

// =============================================================================
// HELPER CONSTANTS
// =============================================================================

/**
 * Retention periods in days for different event types
 */
export const AUTH_AUDIT_RETENTION = {
  COMPLIANCE: 2555, // 7 years
  OPERATIONAL: 90, // 90 days
} as const

/**
 * Map event types to their retention periods
 */
export const EVENT_RETENTION_MAP: Record<string, number> = {
  'user.registered': AUTH_AUDIT_RETENTION.COMPLIANCE,
  'user.password_reset': AUTH_AUDIT_RETENTION.COMPLIANCE,
  'user.login': AUTH_AUDIT_RETENTION.OPERATIONAL,
  'user.logout': AUTH_AUDIT_RETENTION.OPERATIONAL,
  'user.profile_updated': AUTH_AUDIT_RETENTION.OPERATIONAL,
  'user.email_verified': AUTH_AUDIT_RETENTION.COMPLIANCE,
  'admin.role_changed': AUTH_AUDIT_RETENTION.COMPLIANCE,
  'admin.password_reset_sent': AUTH_AUDIT_RETENTION.COMPLIANCE,
  'admin.exercise_reset': AUTH_AUDIT_RETENTION.OPERATIONAL,
  'admin.member_removed': AUTH_AUDIT_RETENTION.COMPLIANCE,
  'admin.party_status_changed': AUTH_AUDIT_RETENTION.COMPLIANCE,
}
