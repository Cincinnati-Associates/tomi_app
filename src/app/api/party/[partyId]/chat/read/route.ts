import { NextRequest, NextResponse } from 'next/server'
import { requirePartyMember } from '@/lib/homebase/auth'
import {
  getOrCreateMainConversation,
  updateReadCursor,
} from '@/lib/group-chat/db'

/**
 * POST /api/party/[partyId]/chat/read
 * Update the read cursor for the current user.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { partyId: string } }
) {
  try {
    const { partyId } = params
    const auth = await requirePartyMember(partyId)
    if ('error' in auth) return auth.error

    const { messageId } = (await request.json()) as { messageId: string }
    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      )
    }

    const conversationId = await getOrCreateMainConversation(partyId)
    await updateReadCursor(conversationId, auth.userId, messageId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Group chat read cursor error:', error)
    return NextResponse.json(
      { error: 'Failed to update read cursor' },
      { status: 500 }
    )
  }
}
