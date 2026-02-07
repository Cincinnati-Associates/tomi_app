import { pgEnum } from 'drizzle-orm/pg-core'

// =============================================================================
// APP-OWNED ENUMS
// These enums are managed by this application via Drizzle migrations
// =============================================================================

// Party/Group Management
export const partyStatusEnum = pgEnum('party_status', [
  'forming',
  'active',
  'under_contract',
  'closed',
  'archived',
])

export const memberRoleEnum = pgEnum('member_role', ['admin', 'member'])

export const inviteStatusEnum = pgEnum('invite_status', [
  'pending',
  'accepted',
  'declined',
])

export const inviteTypeEnum = pgEnum('invite_type', ['email', 'sms', 'link'])

// Visitor/Chat
export const visitorStageEnum = pgEnum('visitor_stage', [
  'explorer',
  'evaluator',
  'ready',
  'calculated',
])

export const chatRoleEnum = pgEnum('chat_role', ['user', 'assistant', 'system'])

// Journey System (PRD-002)
export const journeyStageEnum = pgEnum('journey_stage', [
  'exploring', // Learning about co-ownership, no concrete plans
  'educating', // Actively learning, consuming content
  'preparing', // Assessing readiness, defining preferences
  'ready', // Prepared to join or form a group (readiness_score >= 70)
  'in_group', // Active member of one or more groups
  'owner', // Has closed on a property
])

// Exercise System (PRD-002/003)
export const exerciseCategoryEnum = pgEnum('exercise_category', [
  'individual', // Completed solo
  'group', // Completed with group
  'hybrid', // Can be individual or group context
])

export const exerciseStatusEnum = pgEnum('exercise_status', [
  'in_progress',
  'completed',
])

// User Roles (app-level, separate from party-level member_role)
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'superadmin'])

// Auth Audit Events (PRD-001)
export const authEventTypeEnum = pgEnum('auth_event_type', [
  'user.registered',
  'user.login',
  'user.logout',
  'user.password_reset',
  'user.profile_updated',
  'user.email_verified',
  'admin.role_changed',
  'admin.password_reset_sent',
  'admin.exercise_reset',
  'admin.member_removed',
  'admin.party_status_changed',
])
