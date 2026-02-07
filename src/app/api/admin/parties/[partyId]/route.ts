import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { logAuthEvent } from '@/lib/auth/audit-logger'

export async function GET(
  _request: NextRequest,
  { params }: { params: { partyId: string } }
) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const supabase = createServiceRoleClient()
    const { partyId } = params

    const [partyResult, membersResult, invitesResult] = await Promise.all([
      supabase.from('buying_parties').select('*').eq('id', partyId).single(),
      supabase
        .from('party_members')
        .select('id, user_id, role, invite_status, ownership_percentage, down_payment_contribution, monthly_contribution, joined_at, profiles(id, email, full_name, avatar_url)')
        .eq('party_id', partyId),
      supabase
        .from('party_invites')
        .select('id, invite_type, invite_value, role, expires_at, accepted_at, created_at')
        .eq('party_id', partyId)
        .order('created_at', { ascending: false }),
    ])

    if (partyResult.error || !partyResult.data) {
      return NextResponse.json({ error: 'Party not found' }, { status: 404 })
    }

    return NextResponse.json({
      party: partyResult.data,
      members: membersResult.data || [],
      invites: invitesResult.data || [],
    })
  } catch (error) {
    console.error('Admin party detail error:', error)
    return NextResponse.json({ error: 'Failed to fetch party' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { partyId: string } }
) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const body = await request.json()
    const { status } = body as { status?: string }
    const { partyId } = params

    const validStatuses = ['forming', 'active', 'under_contract', 'closed', 'archived']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Get current status for audit
    const { data: current } = await supabase
      .from('buying_parties')
      .select('status, name')
      .eq('id', partyId)
      .single()

    const { error } = await supabase
      .from('buying_parties')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', partyId)

    if (error) {
      return NextResponse.json({ error: 'Failed to update party' }, { status: 500 })
    }

    await logAuthEvent({
      eventType: 'admin.party_status_changed',
      userId: auth.userId,
      email: auth.email,
      metadata: {
        partyId,
        partyName: current?.name,
        oldStatus: current?.status,
        newStatus: status,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin party update error:', error)
    return NextResponse.json({ error: 'Failed to update party' }, { status: 500 })
  }
}
