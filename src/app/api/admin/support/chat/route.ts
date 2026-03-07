import { streamText, convertToCoreMessages, type Message } from 'ai'
import { NextRequest } from 'next/server'
import { getAIModel } from '@/lib/ai-provider'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { resolvePermissions } from '@/lib/admin/support-permissions'
import { buildSupportSystemPrompt } from '@/lib/admin/support-prompts'
import { createSupportTools } from '@/lib/admin/support-tools'

/**
 * POST /api/admin/support/chat
 * Streaming chat endpoint for Support Homi with tool calling.
 * No targetUserId required — tools discover users dynamically.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body as { messages: Message[] }

    // Admin auth check
    const auth = await requireAdmin()
    if (isAdminError(auth)) return auth

    // Resolve permissions for this admin
    const permissions = resolvePermissions({
      adminUserId: auth.userId,
      adminRole: auth.role,
    })

    // Build system prompt
    const systemPrompt = buildSupportSystemPrompt({
      adminEmail: auth.email,
      adminRole: auth.role,
      permissions,
    })

    // Create tools scoped to this admin's permissions
    const tools = createSupportTools(auth.userId, permissions)

    // Convert UI messages to CoreMessage format for multi-step tool calling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizedMessages = convertToCoreMessages(messages as any)

    const result = await streamText({
      model: getAIModel(),
      system: systemPrompt,
      messages: normalizedMessages,
      tools,
      maxSteps: 5,
      maxTokens: 2000,
      temperature: 0.5,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error(
      'Support chat error:',
      error instanceof Error ? error.message : error
    )
    return new Response(
      JSON.stringify({
        error: 'Failed to generate response',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error),
        }),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
