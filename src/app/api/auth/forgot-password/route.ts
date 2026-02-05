import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { forgotPasswordSchema, formatZodErrors } from '@/lib/validators/auth-schemas'
import { logAuthEvent } from '@/lib/auth/audit-logger'

/**
 * POST /api/auth/forgot-password
 *
 * Initiate password reset flow by sending reset email.
 * Always returns success to prevent email enumeration.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = forgotPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(result.error) },
        { status: 400 }
      )
    }

    const { email } = result.data

    // Send password reset email
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.nextUrl.origin}/auth/reset-password`,
    })

    // Log the attempt (even for non-existent emails - for security monitoring)
    // We don't have userId here since we don't know if the user exists
    await logAuthEvent({
      eventType: 'user.password_reset',
      email,
      metadata: { action: 'reset_requested' },
    })

    if (error) {
      // Don't reveal if email exists or not - always return success
      console.error('Password reset error:', error)
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we sent a password reset link',
    })
  } catch (error) {
    console.error('Unexpected forgot password error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
