/**
 * Support Homi — Data Permissioning Scaffold
 *
 * Every piece of user data flows through permission checks before reaching the LLM.
 * V1 grants everything — the hook points exist for future user-consent-gated access.
 *
 * Future extension: resolvePermissions() is the single point to add user consent
 * lookups, role-based restrictions, or situational access grants.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const PERMISSION_CATEGORIES = [
  'profile_basic',
  'journey_progress',
  'financial',
  'assessment',
  'exercise_responses',
  'chat_history',
  'behavior',
  'pre_signup',
  'party_membership',
] as const

export type PermissionCategory = typeof PERMISSION_CATEGORIES[number]

export type PermissionDecision = 'granted' | 'denied' | 'redacted'

export interface PermissionGrant {
  category: PermissionCategory
  decision: PermissionDecision
  reason?: string
}

export interface PermissionContext {
  adminUserId: string
  adminRole: 'admin' | 'superadmin'
  targetUserId?: string
  targetPartyId?: string
}

export type PermissionSet = Record<PermissionCategory, PermissionGrant>

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

/**
 * Resolve permissions for a given admin context.
 * V1: grants all categories. Future versions will query user_data_consent table,
 * check admin role restrictions, etc.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function resolvePermissions(_ctx: PermissionContext): PermissionSet {
  const permissions = {} as PermissionSet

  for (const category of PERMISSION_CATEGORIES) {
    permissions[category] = {
      category,
      decision: 'granted',
    }
  }

  return permissions
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Check if a specific permission category is granted.
 */
export function isPermitted(
  permissions: PermissionSet,
  category: PermissionCategory
): boolean {
  return permissions[category]?.decision === 'granted'
}

/**
 * Get list of denied category names — used in system prompt so Homi can
 * tell the admin "I don't have access to X".
 */
export function getDeniedCategories(permissions: PermissionSet): string[] {
  return PERMISSION_CATEGORIES.filter(
    (cat) => permissions[cat]?.decision !== 'granted'
  )
}
