import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { logAuthEvent } from '@/lib/auth/audit-logger'

export async function POST(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const supabase = createServiceRoleClient()
    const { userId } = params

    // Get user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (!profile?.email) {
      return NextResponse.json({ error: 'User not found or no email' }, { status: 404 })
    }

    // Generate password reset link via Supabase admin API
    const { error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: profile.email,
    })

    if (error) {
      console.error('Password reset link error:', error)
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 })
    }

    await logAuthEvent({
      eventType: 'admin.password_reset_sent',
      userId: auth.userId,
      email: auth.email,
      metadata: {
        targetUserId: userId,
        targetEmail: profile.email,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Password reset link generated for ${profile.email}`,
    })
  } catch (error) {
    console.error('Admin password reset error:', error)
    return NextResponse.json({ error: 'Failed to send password reset' }, { status: 500 })
  }
}
