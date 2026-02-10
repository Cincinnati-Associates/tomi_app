import { streamText } from "ai"
import { NextRequest } from "next/server"
import { getAIModel } from "@/lib/ai-provider"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { GEMS_SYSTEM_PROMPT } from "@/lib/gems-exercise/prompts"
import { COBUYER_SYSTEM_PROMPT } from "@/lib/cobuyer-assessment/prompts"

const EXERCISE_PROMPTS: Record<string, string> = {
  gems_discovery: GEMS_SYSTEM_PROMPT,
  cobuyer_candidate_assessment: COBUYER_SYSTEM_PROMPT,
}

/**
 * POST /api/chat/exercise
 *
 * Shared streaming endpoint for all conversational exercises.
 * Routes to exercise-specific system prompts based on exerciseSlug.
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = await request.json()
    const { messages, exerciseSlug, answers } = body as {
      messages: Array<{ role: string; content: string }>
      exerciseSlug: string
      answers?: Record<string, unknown>
    }

    // Get exercise-specific system prompt
    const systemPrompt = EXERCISE_PROMPTS[exerciseSlug]
    if (!systemPrompt) {
      return new Response(
        JSON.stringify({ error: `Unknown exercise: ${exerciseSlug}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Build context-aware prompt
    let contextualPrompt = systemPrompt
    if (answers && Object.keys(answers).length > 0) {
      contextualPrompt += `\n\n## Current Answers\n${JSON.stringify(answers, null, 2)}`
    }

    // Normalize messages
    const normalizedMessages = (messages || []).map(
      (msg: { role: string; content: string }) => ({
        role: (msg.role === "user" ? "user" : "assistant") as
          | "user"
          | "assistant",
        content: msg.content,
      })
    )

    const result = await streamText({
      model: getAIModel(),
      system: contextualPrompt,
      messages: normalizedMessages,
      maxTokens: 500,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Exercise chat error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
