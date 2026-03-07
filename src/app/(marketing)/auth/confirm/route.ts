import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

/**
 * GET /auth/confirm?token_hash=...&type=signup|recovery|email
 *
 * Handles Supabase email verification links that use the token_hash flow.
 * This is a fallback for when Supabase sends links in the format:
 *   /auth/confirm?token_hash=abc123&type=signup
 *
 * For the PKCE code flow, /auth/callback handles code exchange instead.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'email' | null

  if (tokenHash && type) {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })

    if (!error) {
      if (type === 'recovery') {
        // Password reset — send to the reset form
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }

      // Email confirmation — send to journey
      return NextResponse.redirect(`${origin}/journey`)
    }

    console.error('Auth confirm error:', error)
  }

  // Fallback: invalid or expired link
  return NextResponse.redirect(`${origin}/?auth_error=true`)
}
