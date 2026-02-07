import { NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function GET() {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const supabase = createServiceRoleClient()

    const [
      usersResult,
      journeysResult,
      partiesResult,
      exerciseResponsesResult,
      recentSignupsResult,
    ] = await Promise.all([
      supabase.from('profiles').select('id, role', { count: 'exact' }),
      supabase.from('user_journeys').select('stage', { count: 'exact' }),
      supabase.from('buying_parties').select('status', { count: 'exact' }),
      supabase.from('user_exercise_responses').select('status', { count: 'exact' }),
      supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ])

    // Count users by role
    const users = usersResult.data || []
    const usersByRole = { user: 0, admin: 0, superadmin: 0 }
    for (const u of users) {
      const role = (u.role || 'user') as keyof typeof usersByRole
      usersByRole[role] = (usersByRole[role] || 0) + 1
    }

    // Count journeys by stage
    const journeys = journeysResult.data || []
    const usersByStage: Record<string, number> = {}
    for (const j of journeys) {
      usersByStage[j.stage] = (usersByStage[j.stage] || 0) + 1
    }

    // Count parties by status
    const parties = partiesResult.data || []
    const partiesByStatus: Record<string, number> = {}
    for (const p of parties) {
      partiesByStatus[p.status] = (partiesByStatus[p.status] || 0) + 1
    }

    // Count exercises by status
    const exercises = exerciseResponsesResult.data || []
    const exercisesByStatus: Record<string, number> = {}
    for (const e of exercises) {
      exercisesByStatus[e.status] = (exercisesByStatus[e.status] || 0) + 1
    }

    return NextResponse.json({
      totalUsers: usersResult.count || users.length,
      usersByRole,
      usersByStage,
      totalParties: partiesResult.count || parties.length,
      partiesByStatus,
      totalExerciseResponses: exerciseResponsesResult.count || exercises.length,
      exercisesByStatus,
      recentSignups30d: recentSignupsResult.count || 0,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
