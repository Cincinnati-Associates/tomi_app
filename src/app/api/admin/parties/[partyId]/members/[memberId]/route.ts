import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { logAuthEvent } from '@/lib/auth/audit-logger'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { partyId: string; memberId: string } }
) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const supabase = createServiceRoleClient()
    const { partyId, memberId } = params

    // Get member details for audit
    const { data: member } = await supabase
      .from('party_members')
      .select('user_id, role, profiles(email)')
      .eq('id', memberId)
      .eq('party_id', partyId)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('party_members')
      .delete()
      .eq('id', memberId)
      .eq('party_id', partyId)

    if (error) {
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    await logAuthEvent({
      eventType: 'admin.member_removed',
      userId: auth.userId,
      email: auth.email,
      metadata: {
        partyId,
        memberId,
        removedUserId: member.user_id,
        removedEmail: (member.profiles as unknown as { email: string } | null)?.email,
        memberRole: member.role,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin member remove error:', error)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { partyId: string; memberId: string } }
) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const body = await request.json()
    const { role } = body as { role?: string }
    const { partyId, memberId } = params

    if (!role || !['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from('party_members')
      .update({ role })
      .eq('id', memberId)
      .eq('party_id', partyId)

    if (error) {
      return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin member update error:', error)
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}
