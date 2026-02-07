import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { logAuthEvent } from '@/lib/auth/audit-logger'

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const supabase = createServiceRoleClient()
    const { userId } = params

    const [profileResult, journeyResult, exercisesResult, partyMembershipsResult] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('user_journeys').select('*').eq('user_id', userId).single(),
        supabase
          .from('user_exercise_responses')
          .select('id, exercise_id, status, computed_scores, version, started_at, completed_at, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('party_members')
          .select('id, party_id, role, invite_status, joined_at, buying_parties(id, name, status)')
          .eq('user_id', userId),
      ])

    if (profileResult.error || !profileResult.data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      profile: profileResult.data,
      journey: journeyResult.data || null,
      exercises: exercisesResult.data || [],
      partyMemberships: partyMembershipsResult.data || [],
    })
  } catch (error) {
    console.error('Admin user detail error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const body = await request.json()
    const { role } = body as { role?: string }
    const { userId } = params

    if (!role || !['user', 'admin', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Superadmin promotion requires superadmin
    if (role === 'superadmin' && auth.role !== 'superadmin') {
      return NextResponse.json({ error: 'Only superadmins can promote to superadmin' }, { status: 403 })
    }

    const supabase = createServiceRoleClient()

    // Get current role for audit
    const { data: current } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', userId)
      .single()

    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
    }

    await logAuthEvent({
      eventType: 'admin.role_changed',
      userId: auth.userId,
      email: auth.email,
      metadata: {
        targetUserId: userId,
        targetEmail: current?.email,
        oldRole: current?.role,
        newRole: role,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
