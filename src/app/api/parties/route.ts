import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { db, profiles } from "@/db"
import { eq } from "drizzle-orm"
import { sendEmail } from "@/lib/email"

/**
 * POST /api/parties
 * Creates a new buying party and generates an invite link.
 *
 * Body: { name: string, targetCity?: string, targetBudget?: number, inviteEmail?: string }
 * Returns: { party: {...}, inviteToken: string, inviteUrl: string, emailSent?: boolean }
 */
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()

  // Verify auth
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

  // Create party with current user as admin
  const { data: party, error: partyError } = await supabase.rpc(
    "create_party_with_admin",
    {
      party_name: partyName,
      target_city: body.targetCity ?? null,
      target_budget: body.targetBudget ?? null,
    }
  )

  if (partyError) {
    console.error("Failed to create party:", partyError)
    return NextResponse.json(
      { error: "Failed to create party" },
      { status: 500 }
    )
  }

  // Generate invite link (7-day expiry)
  const { data: invite, error: inviteError } = await supabase.rpc(
    "create_invite_link",
    {
      p_party_id: party.id,
      p_role: "member",
      p_expires_in_days: 7,
    }
  )

  if (inviteError) {
    console.error("Failed to create invite:", inviteError)
    // Party was created but invite failed — still return party info
    return NextResponse.json({ party, inviteToken: null, inviteUrl: null })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || ""
  const inviteUrl = `${baseUrl}/invite/${invite.invite_value}`

  // Send invite email if provided (fire-and-forget)
  let emailSent = false
  const inviteEmail = body.inviteEmail?.trim().toLowerCase()
  if (inviteEmail) {
    // Look up inviter name
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
    inviteToken: invite.invite_value,
    inviteUrl,
    emailSent,
  })
}
