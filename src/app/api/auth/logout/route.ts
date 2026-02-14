import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { logLogout } from '@/lib/auth/audit-logger'

/**
 * POST /api/auth/logout
 *
 * Sign out the current user and invalidate their session.
 */
export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Get current user before signing out (for audit logging)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Sign out
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json(
        { error: 'Logout failed' },
        { status: 400 }
      )
    }

    // Log the logout event
    if (user) {
      await logLogout(user.id, user.email || undefined)
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully logged out',
    })
  } catch (error) {
    console.error('Unexpected logout error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
