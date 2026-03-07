import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getSiteUrl } from '@/lib/site-url'
import { z } from 'zod'

const resendSchema = z.object({
  email: z.string().email(),
})

/**
 * POST /api/auth/resend-confirmation
 *
 * Resend the email confirmation link for an unverified account.
 * Always returns success to prevent email enumeration.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = resendSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    const { email } = result.data

    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      },
    })

    if (error) {
      console.error('Resend confirmation error:', error)
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an unverified account exists, a new confirmation email has been sent',
    })
  } catch (error) {
    console.error('Unexpected resend confirmation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
