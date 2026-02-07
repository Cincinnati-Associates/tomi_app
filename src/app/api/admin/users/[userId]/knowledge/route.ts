import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import {
  assembleAuthenticatedKnowledge,
  formatKnowledgeForPrompt,
} from '@/lib/user-knowledge'

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const { userId } = params
    const knowledge = await assembleAuthenticatedKnowledge(userId)
    const formatted = formatKnowledgeForPrompt(knowledge)

    return NextResponse.json({ knowledge, formatted })
  } catch (error) {
    console.error('Admin user knowledge error:', error)
    return NextResponse.json({ error: 'Failed to fetch user knowledge' }, { status: 500 })
  }
}
