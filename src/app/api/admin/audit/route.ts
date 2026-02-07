import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || ''
  const eventType = searchParams.get('eventType') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const offset = (page - 1) * limit

  try {
    const supabase = createServiceRoleClient()

    let query = supabase
      .from('auth_audit_logs')
      .select('*', { count: 'exact' })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (eventType) {
      query = query.eq('event_type', eventType)
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Admin audit query error:', error)
      return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
    }

    return NextResponse.json({
      logs: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Admin audit error:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
