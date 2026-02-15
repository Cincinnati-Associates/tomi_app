import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { db, profiles } from '@/db'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Smart redirect based on user state
      const redirectUrl = await getSmartRedirect(data.user.id, next, origin)
      return NextResponse.redirect(redirectUrl)
    }

    console.error('Auth callback error:', error)
  }

  // Return to home with error indicator if something went wrong
  return NextResponse.redirect(`${origin}/?auth_error=true`)
}

/**
 * Determine the appropriate redirect URL based on user's onboarding state
 */
async function getSmartRedirect(userId: string, next: string | null, origin: string): Promise<string> {
  try {
    // Check if user has completed onboarding
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    })

    if (!profile) {
      // Profile not found (shouldn't happen, but handle gracefully)
      // Supabase trigger should create profile, but it may take a moment
      // Send to onboarding which will create journey if needed
      return `${origin}/onboarding/welcome`
    }

    if (!profile.onboardingCompleted) {
      // User hasn't completed onboarding - send to welcome flow
      return `${origin}/onboarding/welcome`
    }

    // User has completed onboarding - respect the next param or go to dashboard
    return `${origin}${next || '/dashboard'}`
  } catch (error) {
    console.error('Error in smart redirect:', error)
    // Fallback to dashboard on error
    return `${origin}${next || '/dashboard'}`
  }
}
