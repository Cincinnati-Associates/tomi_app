import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase-server'
import { updateProfileSchema, formatZodErrors } from '@/lib/validators/auth-schemas'

/**
 * GET /api/users/me
 *
 * Get current authenticated user's profile.
 * Auto-creates the profile if it doesn't exist.
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role to bypass RLS for reliable profile access
    const serviceClient = createServiceRoleClient()

    const { data: profile, error } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist — create one
      console.log('[/api/users/me] Profile not found, creating for user:', user.id)
      const { data: newProfile, error: insertError } = await serviceClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || null,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        })
        .select()
        .single()

      if (insertError) {
        console.error('[/api/users/me] Error creating profile:', insertError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }

      return NextResponse.json(newProfile)
    }

    if (error) {
      console.error('[/api/users/me] Error fetching profile:', error)
      return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[/api/users/me] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/me
 *
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const result = updateProfileSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(result.error) },
        { status: 400 }
      )
    }

    const updates = result.data

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.fullName !== undefined) {
      updateData.full_name = updates.fullName
    }
    if (updates.phone !== undefined) {
      updateData.phone = updates.phone
    }
    if (updates.timezone !== undefined) {
      updateData.timezone = updates.timezone
    }
    if (updates.avatarUrl !== undefined) {
      updateData.avatar_url = updates.avatarUrl
    }

    // Check if profile should be marked as complete
    if (updates.fullName) {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (currentProfile && !currentProfile.onboarding_completed) {
        updateData.onboarding_completed = true
      }
    }

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
