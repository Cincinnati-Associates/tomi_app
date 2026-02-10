import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { getAIModel } from '@/lib/ai-provider'
import { requirePartyMember } from '@/lib/homebase/auth'
import { HOMEBASE_SYSTEM_PROMPT } from '@/lib/homebase/prompts'
import {
  assembleHomebaseContext,
  formatHomebaseContextForPrompt,
} from '@/lib/homebase/knowledge'
import { createHomebaseTools } from '@/lib/homebase/tools'
import { searchDocumentChunks } from '@/lib/homebase/vector-search'
import { generateQueryEmbedding } from '@/lib/homebase/embedding'

/**
 * POST /api/homebase/chat
 * Chat endpoint with RAG retrieval and tool calling for HomeBase.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, partyId } = body as {
      messages: Array<{ role: string; content: string }>
      partyId: string
    }

    // Auth + party membership check
    const auth = await requirePartyMember(partyId)
    if ('error' in auth) return auth.error

    // Get the latest user message for RAG retrieval
    const latestUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user')

    // Run context assembly and RAG retrieval in parallel
    const [homebaseCtx, ragChunks] = await Promise.all([
      assembleHomebaseContext(partyId),
      latestUserMessage
        ? generateQueryEmbedding(latestUserMessage.content).then((embedding) =>
            searchDocumentChunks(partyId, embedding, 5)
          )
        : Promise.resolve([]),
    ])

    // Build the system prompt
    let systemPrompt = HOMEBASE_SYSTEM_PROMPT
    systemPrompt += '\n\n' + formatHomebaseContextForPrompt(homebaseCtx)

    // Add RAG context if we have relevant chunks
    if (ragChunks.length > 0) {
      systemPrompt += '\n\n## Relevant Document Excerpts\n'
      systemPrompt += 'Use these to answer the user\'s question. Cite the document title when referencing information.\n\n'
      for (const chunk of ragChunks) {
        systemPrompt += `### From "${chunk.documentTitle}" (${chunk.documentCategory})\n`
        systemPrompt += chunk.content + '\n\n'
      }
    }

    // Add member context for tool resolution
    systemPrompt += '\n\n## Current User\n'
    const currentUser = homebaseCtx.party.members.find((m) => m.id === auth.userId)
    systemPrompt += `- Current user: ${currentUser?.name || 'Unknown'} (ID: ${auth.userId})\n`
    const otherMembers = homebaseCtx.party.members.filter((m) => m.id !== auth.userId)
    if (otherMembers.length > 0) {
      systemPrompt += `- Co-owners: ${otherMembers.map((m) => `${m.name} (ID: ${m.id})`).join(', ')}\n`
    }

    // Normalize messages
    const normalizedMessages = (messages || []).map(
      (msg: { role: string; content: string }) => ({
        role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content,
      })
    )

    // Create tools scoped to this party and user
    const tools = createHomebaseTools(partyId, auth.userId)

    const result = await streamText({
      model: getAIModel(),
      system: systemPrompt,
      messages: normalizedMessages,
      tools,
      maxSteps: 5, // Allow multiple tool calls in one turn
      maxTokens: 1000,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('HomeBase chat error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
