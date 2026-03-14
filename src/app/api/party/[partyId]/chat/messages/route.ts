import { NextRequest, NextResponse } from 'next/server'
import { requirePartyMember } from '@/lib/homebase/auth'
import {
  getOrCreateMainConversation,
  loadGroupMessages,
} from '@/lib/group-chat/db'

/**
 * GET /api/party/[partyId]/chat/messages
 * Load paginated message history.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { partyId: string } }
) {
  try {
    const { partyId } = params
    const auth = await requirePartyMember(partyId)
    if ('error' in auth) return auth.error

    const { searchParams } = new URL(request.url)
    const before = searchParams.get('before') || undefined
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50', 10),
      100
    )

    const conversationId = await getOrCreateMainConversation(partyId)
    const messages = await loadGroupMessages(conversationId, { limit, before })

    return NextResponse.json({
      messages,
      hasMore: messages.length === limit,
    })
  } catch (error) {
    console.error('Group chat messages error:', error)
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 }
    )
  }
}
