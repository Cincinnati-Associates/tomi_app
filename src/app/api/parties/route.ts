import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { db, profiles, buyingParties, partyMembers, partyInvites } from "@/db"
import { eq } from "drizzle-orm"
import { sendEmail } from "@/lib/email"

/**
 * POST /api/parties
 * Creates a new buying party and generates an invite link.
 *
 * Uses Drizzle transaction for atomicity: party + admin member are created
 * together or not at all. Avoids RPC functions that depend on auth.uid()
 * being available in the server-side context.
 *
 * Body: { name: string, targetCity?: string, targetBudget?: number, inviteEmail?: string }
 * Returns: { party: {...}, inviteToken: string, inviteUrl: string, emailSent?: boolean }
 */
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()

  // Verify auth — JWT validated server-side by Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { name?: string; targetCity?: string; targetBudget?: number; inviteEmail?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const partyName = body.name?.trim()
  if (!partyName) {
    return NextResponse.json(
      { error: "Party name is required" },
      { status: 400 }
    )
  }

  // Atomic transaction: create party + add creator as admin member
  // If either fails, both are rolled back.
  let party: typeof buyingParties.$inferSelect
  try {
    party = await db.transaction(async (tx) => {
      const [newParty] = await tx
        .insert(buyingParties)
        .values({
          name: partyName,
          createdBy: user.id,
          targetCity: body.targetCity ?? null,
          targetBudget: body.targetBudget?.toString() ?? null,
        })
        .returning()

      await tx.insert(partyMembers).values({
        partyId: newParty.id,
        userId: user.id,
        role: "admin",
        inviteStatus: "accepted",
      })

      return newParty
    })
  } catch (error) {
    console.error("Failed to create party:", error)
    return NextResponse.json(
      { error: "Failed to create party" },
      { status: 500 }
    )
  }

  // Generate invite link (non-critical — party already exists)
  const inviteToken = randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  try {
    await db.insert(partyInvites).values({
      partyId: party.id,
      inviteType: "link",
      inviteValue: inviteToken,
      invitedBy: user.id,
      role: "member",
      expiresAt,
    })
  } catch (error) {
    console.error("Failed to create invite:", error)
    // Party was created but invite failed — still return party info
    return NextResponse.json({ party, inviteToken: null, inviteUrl: null })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin") || ""
  const inviteUrl = `${baseUrl}/invite/${inviteToken}`

  // Send invite email if provided (fire-and-forget)
  let emailSent = false
  const inviteEmail = body.inviteEmail?.trim().toLowerCase()
  if (inviteEmail) {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
      columns: { fullName: true, email: true },
    })
    const inviterName = profile?.fullName || profile?.email?.split("@")[0] || "Someone"

    sendEmail({
      type: "party_invite",
      to: inviteEmail,
      data: { inviterName, partyName, inviteUrl },
      userId: user.id,
    }).catch((err) => console.error("Failed to send invite email:", err))

    emailSent = true
  }

  return NextResponse.json({
    party,
    inviteToken,
    inviteUrl,
    emailSent,
  })
}
