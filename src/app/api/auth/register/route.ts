import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { registerSchema, formatZodErrors } from '@/lib/validators/auth-schemas'
import { isPasswordValid } from '@/lib/auth/password-validator'
import { logRegistration } from '@/lib/auth/audit-logger'
import { getSiteUrl } from '@/lib/site-url'

/**
 * POST /api/auth/register
 *
 * Register a new user with email and password.
 * Profile is auto-created by Supabase trigger.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(result.error) },
        { status: 400 }
      )
    }

    const { email, password, fullName } = result.data

    // Additional password validation
    if (!isPasswordValid(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Create user with Supabase Auth
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }

      console.error('Registration error:', error)
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Registration failed - no user returned' },
        { status: 500 }
      )
    }

    // Log the registration event
    await logRegistration(data.user.id, email)

    // Check if email confirmation is required
    const requiresConfirmation = !data.session

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      requiresConfirmation,
      message: requiresConfirmation
        ? 'Please check your email to confirm your account'
        : 'Registration successful',
    })
  } catch (error) {
    console.error('Unexpected registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
