import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { db, userJourneys, userExerciseResponses, exerciseTemplates } from '@/db'
import { eq } from 'drizzle-orm'

interface ExerciseProgress {
  slug: string
  name: string
  status: 'not_started' | 'in_progress' | 'completed'
  isRequired: boolean
  estimatedMinutes: number | null
}

interface JourneyProgress {
  stage: string
  readinessScore: number
  exercisesCompleted: number
  exercisesTotal: number
  nextAction: string | null
  exercises: ExerciseProgress[]
}

/**
 * GET /api/journey/progress
 *
 * Get user's journey progress summary including exercise completion status
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

    // Fetch journey
    const journey = await db.query.userJourneys.findFirst({
      where: eq(userJourneys.userId, user.id),
    })

    if (!journey) {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 })
    }

    // Fetch all active exercise templates
    const templates = await db.query.exerciseTemplates.findMany({
      where: eq(exerciseTemplates.isActive, true),
      orderBy: (templates, { asc }) => [asc(templates.displayOrder)],
    })

    // Fetch user's exercise responses
    const responses = await db.query.userExerciseResponses.findMany({
      where: eq(userExerciseResponses.userId, user.id),
    })

    // Map responses by exercise ID
    const responsesByExerciseId = new Map(
      responses.map(r => [r.exerciseId, r])
    )

    // Build exercise progress list
    const exercises: ExerciseProgress[] = templates.map(template => {
      const response = responsesByExerciseId.get(template.id)
      let status: ExerciseProgress['status'] = 'not_started'

      if (response) {
        status = response.status === 'completed' ? 'completed' : 'in_progress'
      }

      return {
        slug: template.slug,
        name: template.name,
        status,
        isRequired: template.isRequired,
        estimatedMinutes: template.estimatedMinutes,
      }
    })

    // Count completed exercises
    const exercisesCompleted = exercises.filter(e => e.status === 'completed').length
    const exercisesTotal = templates.length

    // Determine next action
    let nextAction: string | null = null

    // Find first incomplete required exercise
    const incompleteRequired = exercises.find(
      e => e.isRequired && e.status !== 'completed'
    )

    if (incompleteRequired) {
      nextAction = `Complete the ${incompleteRequired.name} exercise`
    } else {
      // Find first incomplete optional exercise
      const incompleteOptional = exercises.find(e => e.status !== 'completed')
      if (incompleteOptional) {
        nextAction = `Complete the ${incompleteOptional.name} exercise (optional)`
      } else if (journey.stage === 'exploring' || journey.stage === 'educating') {
        nextAction = 'Explore the calculator to understand your co-buying power'
      }
    }

    const progress: JourneyProgress = {
      stage: journey.stage,
      readinessScore: journey.readinessScore || 0,
      exercisesCompleted,
      exercisesTotal,
      nextAction,
      exercises,
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching journey progress:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
