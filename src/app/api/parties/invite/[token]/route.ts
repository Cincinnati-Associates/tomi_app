import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

/**
 * POST /api/parties/invite/[token]
 * Accepts a party invite by token. Requires authenticated user.
 */
export async function POST(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { token } = params

  const { data: member, error } = await supabase.rpc("accept_invite", {
    p_token: token,
  })

  if (error) {
    console.error("Failed to accept invite:", error)
    return NextResponse.json(
      { error: error.message || "Invalid or expired invite" },
      { status: 400 }
    )
  }

  return NextResponse.json({ member })
}
