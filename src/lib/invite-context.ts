const STORAGE_KEY = "pendingInviteToken"

/**
 * Store an invite token in sessionStorage so it survives auth redirects
 * (e.g. magic link → /auth/callback → /journey).
 */
export function storePendingInvite(token: string): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(STORAGE_KEY, token)
  } catch {
    // Storage full or blocked — non-critical
  }
}

/**
 * Retrieve a pending invite token (if any).
 */
export function getPendingInvite(): string | null {
  if (typeof window === "undefined") return null
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Clear the pending invite token after successful acceptance.
 */
export function clearPendingInvite(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(STORAGE_KEY)
}
