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

    // Always honour explicit `next` for admin/homebase routes
    // (admin users shouldn't be blocked by onboarding)
    if (next && (next.startsWith('/admin') || next.startsWith('/homebase'))) {
      return `${origin}${next}`
    }

    if (!profile || !profile.onboardingCompleted) {
      // New users go to /journey — the useAssessmentLinker hook
      // will auto-link assessment data and mark onboarding complete
      return `${origin}/journey`
    }

    // Returning users - respect the next param or go to journey
    return `${origin}${next || '/journey'}`
  } catch (error) {
    console.error('Error in smart redirect:', error)
    return `${origin}${next || '/dashboard'}`
  }
}
