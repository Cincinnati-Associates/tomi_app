import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { resetPasswordSchema, formatZodErrors } from '@/lib/validators/auth-schemas'
import { isPasswordValid } from '@/lib/auth/password-validator'
import { logPasswordReset } from '@/lib/auth/audit-logger'

/**
 * POST /api/auth/reset-password
 *
 * Complete password reset with new password.
 * User must be authenticated via the reset link (token exchange).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = resetPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(result.error) },
        { status: 400 }
      )
    }

    const { password } = result.data

    // Additional password validation
    if (!isPasswordValid(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Update password - user must be authenticated via reset link
    const supabase = createServerSupabaseClient()

    // First get the current user (from the reset link session)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 401 }
      )
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error('Password reset error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to reset password' },
        { status: 400 }
      )
    }

    // Log the password reset event
    await logPasswordReset(user.id, user.email || '')

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    })
  } catch (error) {
    console.error('Unexpected reset password error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
