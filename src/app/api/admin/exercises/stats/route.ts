import { NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function GET() {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const supabase = createServiceRoleClient()

    // Fetch all templates
    const { data: templates, error: templatesError } = await supabase
      .from('exercise_templates')
      .select('id, slug, name, category, is_active')
      .order('display_order', { ascending: true })

    if (templatesError) {
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    // Fetch all responses grouped by exercise_id and status
    const { data: responses } = await supabase
      .from('user_exercise_responses')
      .select('exercise_id, status')

    // Build counts per exercise
    const counts = new Map<string, { total: number; completed: number; in_progress: number }>()
    for (const r of responses || []) {
      const entry = counts.get(r.exercise_id) || { total: 0, completed: 0, in_progress: 0 }
      entry.total++
      if (r.status === 'completed') entry.completed++
      else entry.in_progress++
      counts.set(r.exercise_id, entry)
    }

    const exercises = (templates || []).map((t) => {
      const c = counts.get(t.id) || { total: 0, completed: 0, in_progress: 0 }
      return {
        ...t,
        total_responses: c.total,
        completed_count: c.completed,
        in_progress_count: c.in_progress,
        completion_rate: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
      }
    })

    return NextResponse.json({ exercises })
  } catch (error) {
    console.error('Admin exercises stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch exercise stats' }, { status: 500 })
  }
}
