import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { db, userJourneys } from '@/db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Validation schema for updating journey
const updateJourneySchema = z.object({
  stage: z.enum(['exploring', 'educating', 'preparing', 'ready', 'in_group', 'owner']).optional(),
  targetTimeline: z.string().max(50).optional(),
  targetMarkets: z.array(z.string()).optional(),
  budgetRangeLow: z.number().int().positive().optional(),
  budgetRangeHigh: z.number().int().positive().optional(),
  coBuyerStatus: z.string().max(50).optional(),
})

/**
 * GET /api/journey
 *
 * Get current authenticated user's journey data
 */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch journey from database
    const journey = await db.query.userJourneys.findFirst({
      where: eq(userJourneys.userId, user.id),
    })

    if (!journey) {
      // Journey not found - this shouldn't happen with the trigger
      // Create one on the fly
      const [newJourney] = await db
        .insert(userJourneys)
        .values({
          userId: user.id,
          stage: 'exploring',
          readinessScore: 0,
        })
        .returning()

      return NextResponse.json(newJourney)
    }

    return NextResponse.json(journey)
  } catch (error) {
    console.error('Error fetching journey:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/journey
 *
 * Update current user's journey data
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
    const result = updateJourneySchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const updates = result.data

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (updates.stage !== undefined) {
      updateData.stage = updates.stage
    }
    if (updates.targetTimeline !== undefined) {
      updateData.targetTimeline = updates.targetTimeline
    }
    if (updates.targetMarkets !== undefined) {
      updateData.targetMarkets = updates.targetMarkets
    }
    if (updates.budgetRangeLow !== undefined) {
      updateData.budgetRangeLow = updates.budgetRangeLow
    }
    if (updates.budgetRangeHigh !== undefined) {
      updateData.budgetRangeHigh = updates.budgetRangeHigh
    }
    if (updates.coBuyerStatus !== undefined) {
      updateData.coBuyerStatus = updates.coBuyerStatus
    }

    // Check if there are any updates
    if (Object.keys(updateData).length === 1) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update journey (or create if doesn't exist)
    const journey = await db.query.userJourneys.findFirst({
      where: eq(userJourneys.userId, user.id),
    })

    if (!journey) {
      // Create journey if it doesn't exist
      const [newJourney] = await db
        .insert(userJourneys)
        .values({
          userId: user.id,
          stage: (updates.stage as 'exploring' | 'educating' | 'preparing' | 'ready' | 'in_group' | 'owner') || 'exploring',
          readinessScore: 0,
          targetTimeline: updates.targetTimeline,
          targetMarkets: updates.targetMarkets || [],
          budgetRangeLow: updates.budgetRangeLow,
          budgetRangeHigh: updates.budgetRangeHigh,
          coBuyerStatus: updates.coBuyerStatus,
        })
        .returning()

      return NextResponse.json(newJourney)
    }

    // Update existing journey
    const [updatedJourney] = await db
      .update(userJourneys)
      .set(updateData)
      .where(eq(userJourneys.userId, user.id))
      .returning()

    if (!updatedJourney) {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 })
    }

    return NextResponse.json(updatedJourney)
  } catch (error) {
    console.error('Error updating journey:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
