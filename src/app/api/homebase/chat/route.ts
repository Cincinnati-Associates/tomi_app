import { streamText, convertToCoreMessages, type Message } from 'ai'
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
      messages: Message[]
      partyId: string
    }

    // Auth + party membership check
    const auth = await requirePartyMember(partyId)
    if ('error' in auth) return auth.error

    // Get the latest user message text for RAG retrieval
    const latestUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user')
    const latestUserText = latestUserMessage
      ? (typeof latestUserMessage.content === 'string'
          ? latestUserMessage.content
          : '')
      : ''

    // Run context assembly and RAG retrieval in parallel
    let homebaseCtx
    let ragChunks: Awaited<ReturnType<typeof searchDocumentChunks>> = []
    try {
      ;[homebaseCtx, ragChunks] = await Promise.all([
        assembleHomebaseContext(partyId),
        latestUserText
          ? generateQueryEmbedding(latestUserText).then((embedding) =>
              searchDocumentChunks(partyId, embedding, 5)
            )
          : Promise.resolve([]),
      ])
    } catch (ctxError) {
      console.error('HomeBase context assembly error:', ctxError instanceof Error ? ctxError.message : ctxError)
      console.error('HomeBase context stack:', ctxError instanceof Error ? ctxError.stack : '')
      // Fall back to minimal context so chat still works
      homebaseCtx = { party: { id: partyId, name: 'Home', members: [] }, documents: [], tasks: [], projects: [], labels: [], recentActivity: [] }
    }

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

    // Add date context for resolving relative dates
    const today = new Date()
    systemPrompt += `\n\n## Date Context\n`
    systemPrompt += `- Today is ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`
    systemPrompt += `- Today's ISO date: ${today.toISOString().split('T')[0]}\n`
    systemPrompt += `- When the user says "tomorrow", "next week", etc., convert to an ISO date (YYYY-MM-DD) for tool calls.\n`

    // Add member context for tool resolution
    systemPrompt += '\n\n## Current User\n'
    const currentUser = homebaseCtx.party.members.find((m) => m.id === auth.userId)
    systemPrompt += `- Current user: ${currentUser?.name || 'Unknown'} (ID: ${auth.userId})\n`
    const otherMembers = homebaseCtx.party.members.filter((m) => m.id !== auth.userId)
    if (otherMembers.length > 0) {
      systemPrompt += `- Co-owners: ${otherMembers.map((m) => `${m.name} (ID: ${m.id})`).join(', ')}\n`
    }

    // Convert UI messages (from useChat) to CoreMessage format.
    // This properly handles tool call/result parts for multi-step tool calling.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizedMessages = convertToCoreMessages(messages as any)

    // Create tools scoped to this party and user
    const tools = createHomebaseTools(partyId, auth.userId)

    const result = await streamText({
      model: getAIModel(),
      system: systemPrompt,
      messages: normalizedMessages,
      tools,
      maxSteps: 5, // Allow multiple tool calls in one turn
      maxTokens: 2000,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('HomeBase chat error:', error instanceof Error ? error.message : error)
    console.error('HomeBase chat stack:', error instanceof Error ? error.stack : 'no stack')
    return new Response(
      JSON.stringify({ error: 'Failed to generate response', details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
