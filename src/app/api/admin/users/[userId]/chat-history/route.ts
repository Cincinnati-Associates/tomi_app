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

    const { data: conversations, error } = await supabase
      .from('chat_conversations')
      .select(`
        id, title, started_at, last_message_at, message_count,
        topics_discussed, sentiment, summary, is_archived,
        chat_messages(id, role, content, created_at)
      `)
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false })

    if (error) {
      console.error('Admin chat history error:', error)
      return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 })
    }

    return NextResponse.json({ conversations: conversations || [] })
  } catch (error) {
    console.error('Admin chat history error:', error)
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 })
  }
}
