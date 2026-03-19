import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { db, partyInvites, buyingParties, partyMembers, profiles } from "@/db"
import { eq, and, isNull, gt } from "drizzle-orm"

/**
 * GET /api/parties/invites/pending
 *
 * Returns pending (unaccepted, unexpired) party invites for the authenticated
 * user's email. Safety net for when the invite link flow breaks (e.g. magic
 * link redirect loses the token).
 */
export async function GET() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ invites: [] })
  }

  try {
    // Find unexpired, unaccepted invites sent to this user's email
    const invites = await db
      .select({
        token: partyInvites.inviteValue,
        partyId: partyInvites.partyId,
        partyName: buyingParties.name,
        inviterName: profiles.fullName,
        expiresAt: partyInvites.expiresAt,
      })
      .from(partyInvites)
      .innerJoin(buyingParties, eq(partyInvites.partyId, buyingParties.id))
      .leftJoin(profiles, eq(partyInvites.invitedBy, profiles.id))
      .where(
        and(
          eq(partyInvites.invitedEmail, user.email),
          isNull(partyInvites.acceptedAt),
          gt(partyInvites.expiresAt, new Date())
        )
      )

    // Filter out invites for parties the user is already a member of
    const filtered = []
    for (const invite of invites) {
      const existing = await db.query.partyMembers.findFirst({
        where: and(
          eq(partyMembers.partyId, invite.partyId),
          eq(partyMembers.userId, user.id)
        ),
      })
      if (!existing) {
        filtered.push({
          token: invite.token,
          partyName: invite.partyName,
          inviterName: invite.inviterName ?? "Someone",
          expiresAt: invite.expiresAt,
        })
      }
    }

    return NextResponse.json({ invites: filtered })
  } catch (error) {
    console.error("Failed to fetch pending invites:", error)
    return NextResponse.json({ invites: [] })
  }
}
