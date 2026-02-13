import { createServerSupabaseClient } from '@/lib/supabase-server'
import { db, partyMembers, homeTasks } from '@/db'
import { eq, and, sql } from 'drizzle-orm'

/**
 * Verify the current user is authenticated and return their ID.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedUser(): Promise<string | null> {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

/**
 * Verify the user is a member of the given party.
 */
export async function verifyPartyMembership(
  userId: string,
  partyId: string
): Promise<boolean> {
  const member = await db.query.partyMembers.findFirst({
    where: and(
      eq(partyMembers.partyId, partyId),
      eq(partyMembers.userId, userId),
      eq(partyMembers.inviteStatus, 'accepted')
    ),
  })
  return !!member
}

/**
 * Combined auth + party membership check.
 * Returns userId if valid, or a Response with error.
 */
export async function requirePartyMember(
  partyId: string | null
): Promise<{ userId: string } | { error: Response }> {
  const userId = await getAuthenticatedUser()
  if (!userId) {
    return {
      error: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    }
  }

  if (!partyId) {
    return {
      error: new Response(JSON.stringify({ error: 'partyId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    }
  }

  const isMember = await verifyPartyMembership(userId, partyId)
  if (!isMember) {
    return {
      error: new Response(JSON.stringify({ error: 'Not a member of this party' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    }
  }

  return { userId }
}

/**
 * Get the next task number for a party (max + 1, or 1 if none exist).
 */
export async function getNextTaskNumber(partyId: string): Promise<number> {
  const [result] = await db
    .select({ max: sql<number>`COALESCE(MAX(${homeTasks.taskNumber}), 0)` })
    .from(homeTasks)
    .where(eq(homeTasks.partyId, partyId))
  return (result?.max ?? 0) + 1
}
