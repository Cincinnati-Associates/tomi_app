import {
  db,
  buyingParties,
  partyMembers,
  userExerciseResponses,
  exerciseTemplates,
} from '@/db'
import { eq, and } from 'drizzle-orm'
import type { GroupChatUnlockStatus } from './types'

/**
 * Check if group chat is unlocked for a party.
 *
 * Unlock conditions:
 * - The party creator has completed the Co-Buyer Check-In exercise
 *   for each accepted party member (one completion per co-buyer).
 *
 * For V1, we relax this: group chat is unlocked once the party has
 * at least 2 accepted members. The Check-In gate is tracked for display
 * but does not block access.
 */
export async function checkGroupChatUnlock(
  userId: string,
  partyId: string
): Promise<GroupChatUnlockStatus> {
  // Get the party
  const party = await db.query.buyingParties.findFirst({
    where: eq(buyingParties.id, partyId),
  })
  if (!party) {
    return { unlocked: false, reason: 'Party not found' }
  }

  // Get accepted members
  const members = await db.query.partyMembers.findMany({
    where: and(
      eq(partyMembers.partyId, partyId),
      eq(partyMembers.inviteStatus, 'accepted')
    ),
    with: { user: true },
  })

  if (members.length < 2) {
    return {
      unlocked: false,
      reason: 'Invite at least one co-buyer to your party to unlock group chat',
    }
  }

  // Find the cobuyer_candidate_assessment template
  const template = await db.query.exerciseTemplates.findFirst({
    where: eq(exerciseTemplates.slug, 'cobuyer_candidate_assessment'),
  })

  if (!template) {
    // If template doesn't exist yet, unlock anyway (exercise not configured)
    return { unlocked: true }
  }

  // Check which members the creator has completed check-ins for
  const creatorId = party.createdBy
  const otherMembers = members.filter((m) => m.userId !== creatorId)

  const completedResponses = await db.query.userExerciseResponses.findMany({
    where: and(
      eq(userExerciseResponses.userId, creatorId!),
      eq(userExerciseResponses.exerciseId, template.id),
      eq(userExerciseResponses.status, 'completed')
    ),
  })

  const completedTargets = new Set(
    completedResponses
      .map((r) => r.targetUserId)
      .filter(Boolean)
  )

  const checkinProgress = otherMembers.map((m) => ({
    memberId: m.userId,
    memberName: m.user?.fullName || m.user?.email || 'Unknown',
    completed: completedTargets.has(m.userId),
  }))

  // V1: Unlock even without check-ins — just track progress
  return {
    unlocked: true,
    checkinProgress,
  }
}
