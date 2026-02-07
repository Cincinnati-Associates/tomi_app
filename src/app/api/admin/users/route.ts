import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '25', 10)
  const offset = (page - 1) * limit

  try {
    const supabase = createServiceRoleClient()

    let query = supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, onboarding_completed, created_at', { count: 'exact' })

    if (q) {
      // Search by email, name, or UUID prefix
      query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%,id.ilike.${q}%`)
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Admin users query error:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Fetch journey data for these users
    const userIds = (data || []).map((u) => u.id)
    const { data: journeys } = userIds.length > 0
      ? await supabase
          .from('user_journeys')
          .select('user_id, stage, readiness_score')
          .in('user_id', userIds)
      : { data: [] }

    const journeyMap = new Map<string, { stage: string; readiness_score: number | null }>()
    for (const j of journeys || []) {
      journeyMap.set(j.user_id, { stage: j.stage, readiness_score: j.readiness_score })
    }

    const users = (data || []).map((u) => ({
      ...u,
      journey: journeyMap.get(u.id) || null,
    }))

    return NextResponse.json({
      users,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
