import { db, authAuditLogs, EVENT_RETENTION_MAP } from '@/db'
import { headers } from 'next/headers'

/**
 * Auth Audit Logger
 *
 * Logs authentication events for SOC2/ISO27001 compliance (PRD-001 §4.2).
 *
 * Retention Policy:
 * - 7 years (2555 days): user.registered, user.password_reset, user.email_verified
 * - 90 days: user.login, user.logout, user.profile_updated
 */

export type AuthEventType =
  | 'user.registered'
  | 'user.login'
  | 'user.logout'
  | 'user.password_reset'
  | 'user.profile_updated'
  | 'user.email_verified'
  | 'admin.role_changed'
  | 'admin.password_reset_sent'
  | 'admin.exercise_reset'
  | 'admin.member_removed'
  | 'admin.party_status_changed'

export interface AuditLogInput {
  eventType: AuthEventType
  userId?: string
  email?: string
  metadata?: Record<string, unknown>
}

/**
 * Get client IP address from request headers
 */
function getClientIp(): string | undefined {
  const headersList = headers()

  // Check common proxy headers
  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headersList.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Vercel-specific header
  const vercelIp = headersList.get('x-vercel-forwarded-for')
  if (vercelIp) {
    return vercelIp.split(',')[0].trim()
  }

  return undefined
}

/**
 * Get user agent from request headers
 */
function getUserAgent(): string | undefined {
  const headersList = headers()
  return headersList.get('user-agent') || undefined
}

/**
 * Log an authentication event
 *
 * Call this from API routes after auth actions.
 * The function automatically captures IP and user agent from request headers.
 */
export async function logAuthEvent(input: AuditLogInput): Promise<void> {
  const { eventType, userId, email, metadata } = input

  const retentionDays = EVENT_RETENTION_MAP[eventType] || 90

  try {
    await db.insert(authAuditLogs).values({
      eventType,
      userId,
      email,
      ipAddress: getClientIp(),
      userAgent: getUserAgent(),
      metadata: metadata || {},
      retentionDays,
    })
  } catch (error) {
    // Log but don't throw - audit logging should not break auth flow
    console.error('Failed to log auth event:', error)
  }
}

/**
 * Log a registration event
 */
export async function logRegistration(userId: string, email: string): Promise<void> {
  await logAuthEvent({
    eventType: 'user.registered',
    userId,
    email,
  })
}

/**
 * Log a login event
 */
export async function logLogin(userId: string, email: string): Promise<void> {
  await logAuthEvent({
    eventType: 'user.login',
    userId,
    email,
  })
}

/**
 * Log a logout event
 */
export async function logLogout(userId: string, email?: string): Promise<void> {
  await logAuthEvent({
    eventType: 'user.logout',
    userId,
    email,
  })
}

/**
 * Log a password reset event
 */
export async function logPasswordReset(userId: string, email: string): Promise<void> {
  await logAuthEvent({
    eventType: 'user.password_reset',
    userId,
    email,
  })
}

/**
 * Log a profile update event
 */
export async function logProfileUpdate(
  userId: string,
  changedFields: string[],
  email?: string
): Promise<void> {
  await logAuthEvent({
    eventType: 'user.profile_updated',
    userId,
    email,
    metadata: { changedFields },
  })
}

/**
 * Log an email verification event
 */
export async function logEmailVerified(userId: string, email: string): Promise<void> {
  await logAuthEvent({
    eventType: 'user.email_verified',
    userId,
    email,
  })
}
