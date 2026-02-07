import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { getAIModel } from '@/lib/ai-provider'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { buildAdminSystemPrompt } from '@/lib/admin/admin-prompts'
import {
  assembleAuthenticatedKnowledge,
  formatKnowledgeForPrompt,
} from '@/lib/user-knowledge'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  try {
    const body = await request.json()
    const { messages: rawMessages, targetUserId } = body as {
      messages?: Array<{ role: string; content: string }>
      targetUserId?: string
    }

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: 'targetUserId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get target user's name
    const supabase = createServiceRoleClient()
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', targetUserId)
      .single()

    // Assemble target user's knowledge
    const knowledge = await assembleAuthenticatedKnowledge(targetUserId)
    const knowledgeSection = formatKnowledgeForPrompt(knowledge)

    // Build admin system prompt
    const systemPrompt = buildAdminSystemPrompt({
      adminEmail: auth.email,
      targetUserName:
        targetProfile?.full_name || targetProfile?.email || 'Unknown User',
      targetUserId,
      knowledgeSection,
    })

    // Normalize messages
    const messages = (rawMessages || []).map(
      (msg: { role: string; content: string }) => ({
        role: (msg.role === 'user' ? 'user' : 'assistant') as
          | 'user'
          | 'assistant',
        content: msg.content,
      })
    )

    // Stream response with higher token limit for analytical responses
    const result = await streamText({
      model: getAIModel(),
      system: systemPrompt,
      messages,
      maxTokens: 1000,
      temperature: 0.5,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Admin chat error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process admin chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
