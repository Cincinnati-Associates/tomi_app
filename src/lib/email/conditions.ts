import { db } from '@/db'
import { profiles, userJourneys } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { CancelCondition } from './types'

/**
 * Evaluate a cancel condition at send time.
 * Returns true if the email should be cancelled (condition met).
 */
export async function evaluateCancelCondition(
  condition: CancelCondition
): Promise<boolean> {
  switch (condition.type) {
    case 'user_signed_up': {
      if (!condition.email) return false
      const profile = await db.query.profiles.findFirst({
        where: eq(profiles.email, condition.email),
        columns: { id: true },
      })
      return !!profile
    }

    case 'user_started_journey': {
      if (!condition.userId) return false
      const journey = await db.query.userJourneys.findFirst({
        where: eq(userJourneys.userId, condition.userId),
        columns: { id: true },
      })
      return !!journey
    }

    case 'user_active_within_days': {
      if (!condition.userId || !condition.days) return false
      const profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, condition.userId),
        columns: { updatedAt: true },
      })
      if (!profile) return false
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - condition.days)
      return profile.updatedAt > cutoff
    }

    default:
      return false
  }
}
