import { db, partyMembers } from '@/db'
import { eq, and } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/homebase/auth'

/**
 * GET /api/homebase/parties
 * Returns the user's parties with status 'closed' (co-owned properties).
 */
export async function GET() {
  const userId = await getAuthenticatedUser()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all party memberships for this user
  const memberships = await db.query.partyMembers.findMany({
    where: and(
      eq(partyMembers.userId, userId),
      eq(partyMembers.inviteStatus, 'accepted')
    ),
    with: {
      party: {
        with: {
          members: {
            with: {
              user: true,
            },
          },
        },
      },
    },
  })

  // Filter to closed parties and format
  const closedParties = memberships
    .filter((m) => m.party.status === 'closed')
    .map((m) => ({
      id: m.party.id,
      name: m.party.name,
      members: m.party.members
        .filter((pm) => pm.inviteStatus === 'accepted')
        .map((pm) => pm.user?.fullName || pm.user?.email || 'Unknown'),
    }))

  return Response.json(closedParties)
}
