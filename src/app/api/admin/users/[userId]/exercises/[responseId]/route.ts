import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { logAuthEvent } from '@/lib/auth/audit-logger'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { userId: string; responseId: string } }
) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const supabase = createServiceRoleClient()
    const { userId, responseId } = params

    // Get response details for audit
    const { data: response } = await supabase
      .from('user_exercise_responses')
      .select('exercise_id, status, version')
      .eq('id', responseId)
      .eq('user_id', userId)
      .single()

    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('user_exercise_responses')
      .delete()
      .eq('id', responseId)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete response' }, { status: 500 })
    }

    await logAuthEvent({
      eventType: 'admin.exercise_reset',
      userId: auth.userId,
      email: auth.email,
      metadata: {
        targetUserId: userId,
        responseId,
        exerciseId: response.exercise_id,
        previousStatus: response.status,
        action: 'delete',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin exercise delete error:', error)
    return NextResponse.json({ error: 'Failed to delete exercise response' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string; responseId: string } }
) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const supabase = createServiceRoleClient()
    const { userId, responseId } = params

    // Mark exercise as incomplete (allow retake)
    const { error } = await supabase
      .from('user_exercise_responses')
      .update({
        status: 'in_progress',
        completed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', responseId)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: 'Failed to update response' }, { status: 500 })
    }

    await logAuthEvent({
      eventType: 'admin.exercise_reset',
      userId: auth.userId,
      email: auth.email,
      metadata: {
        targetUserId: userId,
        responseId,
        action: 'mark_incomplete',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin exercise update error:', error)
    return NextResponse.json({ error: 'Failed to update exercise response' }, { status: 500 })
  }
}
