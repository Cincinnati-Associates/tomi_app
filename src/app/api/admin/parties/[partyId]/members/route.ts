import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { logAuthEvent } from '@/lib/auth/audit-logger'

export async function POST(
  request: NextRequest,
  { params }: { params: { partyId: string } }
) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const body = await request.json()
    const { userId, role = 'member' } = body as {
      userId?: string
      role?: string
    }
    const { partyId } = params

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify party exists
    const { data: party, error: partyError } = await supabase
      .from('buying_parties')
      .select('id, name')
      .eq('id', partyId)
      .single()

    if (partyError || !party) {
      return NextResponse.json({ error: 'Party not found' }, { status: 404 })
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('party_members')
      .select('id')
      .eq('party_id', partyId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'User is already a member of this party' },
        { status: 409 }
      )
    }

    // Insert member with accepted status (admin-added, no invite flow)
    const { data: member, error: insertError } = await supabase
      .from('party_members')
      .insert({
        party_id: partyId,
        user_id: userId,
        role,
        invite_status: 'accepted',
      })
      .select('id, user_id, role, invite_status, joined_at')
      .single()

    if (insertError) {
      console.error('Admin add member error:', insertError)
      return NextResponse.json(
        { error: 'Failed to add member' },
        { status: 500 }
      )
    }

    await logAuthEvent({
      eventType: 'admin.member_added',
      userId: auth.userId,
      email: auth.email,
      metadata: {
        partyId,
        partyName: party.name,
        addedUserId: userId,
        addedEmail: user.email,
        addedName: user.full_name,
        role,
      },
    })

    return NextResponse.json({
      ...member,
      profiles: { id: user.id, email: user.email, full_name: user.full_name },
    })
  } catch (error) {
    console.error('Admin add member error:', error)
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    )
  }
}
