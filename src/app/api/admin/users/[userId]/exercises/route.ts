import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const supabase = createServiceRoleClient()
    const { userId } = params

    // Fetch exercise responses with template details
    const { data: responses, error } = await supabase
      .from('user_exercise_responses')
      .select(`
        id, exercise_id, responses, computed_scores, status, version,
        started_at, completed_at, created_at, updated_at,
        exercise_templates(id, slug, name, category)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Admin exercises query error:', error)
      return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
    }

    return NextResponse.json({ responses: responses || [] })
  } catch (error) {
    console.error('Admin exercises error:', error)
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
}
