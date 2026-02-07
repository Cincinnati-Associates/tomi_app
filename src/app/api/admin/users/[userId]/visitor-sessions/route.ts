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

    // Get visitor links for this user
    const { data: links } = await supabase
      .from('visitor_user_links')
      .select('visitor_id, merged_context, linked_at')
      .eq('user_id', userId)

    // Get visitor sessions linked to this user
    const { data: sessions, error } = await supabase
      .from('visitor_sessions')
      .select('*')
      .eq('linked_user_id', userId)
      .order('last_seen', { ascending: false })

    if (error) {
      console.error('Admin visitor sessions error:', error)
      return NextResponse.json({ error: 'Failed to fetch visitor sessions' }, { status: 500 })
    }

    return NextResponse.json({
      visitorLinks: links || [],
      sessions: sessions || [],
    })
  } catch (error) {
    console.error('Admin visitor sessions error:', error)
    return NextResponse.json({ error: 'Failed to fetch visitor sessions' }, { status: 500 })
  }
}
