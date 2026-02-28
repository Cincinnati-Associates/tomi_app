// =============================================================================
// EMAIL TYPES
// =============================================================================

/** All email types supported by the system */
export type EmailType =
  | 'party_invite'
  | 'welcome'
  | 'assessment_results'
  | 'lead_nurture_1'
  | 'lead_nurture_2'
  | 'lead_nurture_3'
  | 'onboarding_nudge'

/** Per-type payload data for template rendering */
export interface EmailDataMap {
  party_invite: {
    inviterName: string
    partyName: string
    inviteUrl: string
  }
  welcome: {
    fullName: string
  }
  assessment_results: {
    email: string
    grade: string
    score: number
    strengths: string[]
    growthAreas: string[]
  }
  lead_nurture_1: {
    email: string
  }
  lead_nurture_2: {
    email: string
  }
  lead_nurture_3: {
    email: string
  }
  onboarding_nudge: {
    fullName: string
  }
}

/** Request to send a single email */
export interface SendEmailRequest<T extends EmailType = EmailType> {
  type: T
  to: string
  data: EmailDataMap[T]
  userId?: string
  leadEmail?: string
  idempotencyKey?: string
}

/** Result of a send attempt */
export interface SendEmailResult {
  success: boolean
  emailSendId?: string
  resendId?: string
  error?: string
}

/** Cancel condition types for scheduled sequences */
export type CancelConditionType =
  | 'user_signed_up'
  | 'user_started_journey'
  | 'user_active_within_days'

export interface CancelCondition {
  type: CancelConditionType
  /** Email to check (for user_signed_up) */
  email?: string
  /** User ID to check (for user_started_journey, user_active_within_days) */
  userId?: string
  /** Number of days for user_active_within_days */
  days?: number
}
