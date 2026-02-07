import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '25', 10)
  const offset = (page - 1) * limit

  try {
    const supabase = createServiceRoleClient()

    let query = supabase
      .from('buying_parties')
      .select('id, name, status, target_city, target_budget, created_at, created_by', { count: 'exact' })

    if (q) {
      query = query.or(`name.ilike.%${q}%,target_city.ilike.%${q}%,id.ilike.${q}%`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Admin parties query error:', error)
      return NextResponse.json({ error: 'Failed to fetch parties' }, { status: 500 })
    }

    // Get member counts
    const partyIds = (data || []).map((p) => p.id)
    const { data: members } = partyIds.length > 0
      ? await supabase
          .from('party_members')
          .select('party_id')
          .in('party_id', partyIds)
      : { data: [] }

    const memberCounts = new Map<string, number>()
    for (const m of members || []) {
      memberCounts.set(m.party_id, (memberCounts.get(m.party_id) || 0) + 1)
    }

    const parties = (data || []).map((p) => ({
      ...p,
      member_count: memberCounts.get(p.id) || 0,
    }))

    return NextResponse.json({
      parties,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Admin parties error:', error)
    return NextResponse.json({ error: 'Failed to fetch parties' }, { status: 500 })
  }
}
