import { NextResponse } from "next/server"
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "@/lib/supabase-server"
import type { PartyData, PartyMemberProgress } from "@/lib/journey/types"

/**
 * GET /api/parties/mine
 * Returns the authenticated user's active buying party with member exercise progress.
 */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceClient = createServiceRoleClient()

    // Find the user's active party membership
    const { data: membership, error: memberError } = await serviceClient
      .from("party_members")
      .select("party_id, role")
      .eq("user_id", user.id)
      .eq("invite_status", "accepted")
      .limit(1)
      .maybeSingle()

    if (memberError) {
      console.error("Failed to fetch party membership:", memberError)
      return NextResponse.json(
        { error: "Failed to fetch party data" },
        { status: 500 }
      )
    }

    // No party — return null party with empty members
    if (!membership) {
      const result: PartyData = { party: null, members: [] }
      return NextResponse.json(result)
    }

    // Fetch party details, accepted members, and exercise templates in parallel
    const [partyResult, membersResult, templatesResult] = await Promise.all([
      serviceClient
        .from("buying_parties")
        .select("id, name, status, target_city")
        .eq("id", membership.party_id)
        .single(),
      serviceClient
        .from("party_members")
        .select("user_id, role, joined_at")
        .eq("party_id", membership.party_id)
        .eq("invite_status", "accepted"),
      serviceClient
        .from("exercise_templates")
        .select("id, slug")
        .eq("is_active", true),
    ])

    if (partyResult.error) throw partyResult.error

    const party = partyResult.data
    const memberRows = membersResult.data || []
    const memberUserIds = memberRows.map((m) => m.user_id)

    // Build exercise_id → slug map
    const templateMap = new Map<string, string>()
    for (const t of templatesResult.data || []) {
      templateMap.set(t.id, t.slug)
    }

    // Fetch profiles and exercise responses for all members in parallel
    const [profilesResult, responsesResult] = await Promise.all([
      serviceClient
        .from("profiles")
        .select("id, full_name, avatar_url, updated_at")
        .in("id", memberUserIds),
      serviceClient
        .from("user_exercise_responses")
        .select("user_id, exercise_id, status, version")
        .in("user_id", memberUserIds)
        .order("version", { ascending: false }),
    ])

    const profileMap = new Map(
      (profilesResult.data || []).map((p) => [p.id, p])
    )

    // Build per-member progress: latest version per (user, exercise)
    const memberProgress = new Map<
      string,
      { slug: string; status: string }[]
    >()
    const seenKeys = new Set<string>()

    for (const resp of responsesResult.data || []) {
      const key = `${resp.user_id}:${resp.exercise_id}`
      if (seenKeys.has(key)) continue
      seenKeys.add(key)

      const slug = templateMap.get(resp.exercise_id)
      if (!slug) continue

      if (!memberProgress.has(resp.user_id)) {
        memberProgress.set(resp.user_id, [])
      }
      memberProgress.get(resp.user_id)!.push({
        slug,
        status: resp.status,
      })
    }

    // Assemble members array
    const members: PartyMemberProgress[] = memberRows.map((m) => {
      const profile = profileMap.get(m.user_id)
      const progress = memberProgress.get(m.user_id) || []
      const completedCount = progress.filter(
        (p) => p.status === "completed"
      ).length

      return {
        userId: m.user_id,
        name: profile?.full_name || "Member",
        avatarUrl: profile?.avatar_url || null,
        role: m.role as "admin" | "member",
        exerciseProgress: progress,
        completedCount,
        lastActive: profile?.updated_at || m.joined_at,
      }
    })

    const result: PartyData = {
      party: {
        id: party.id,
        name: party.name,
        status: party.status,
        targetCity: party.target_city,
      },
      members,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Parties/mine error:", error)
    return NextResponse.json(
      { error: "Failed to load party data" },
      { status: 500 }
    )
  }
}
