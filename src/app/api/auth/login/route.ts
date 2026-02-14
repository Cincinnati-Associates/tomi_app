import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { loginSchema, formatZodErrors } from '@/lib/validators/auth-schemas'
import { logLogin } from '@/lib/auth/audit-logger'

/**
 * POST /api/auth/login
 *
 * Authenticate user with email and password.
 * Returns session data on success.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(result.error) },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // Authenticate with Supabase
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Generic error message to prevent email enumeration
      if (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('Email not confirmed')
      ) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      console.error('Login error:', error)
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 401 }
      )
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Login failed - no session returned' },
        { status: 500 }
      )
    }

    // Log the login event
    await logLogin(data.user.id, email)

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: {
        accessToken: data.session.access_token,
        expiresAt: data.session.expires_at,
      },
    })
  } catch (error) {
    console.error('Unexpected login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
