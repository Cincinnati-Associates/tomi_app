import { streamText } from "ai";
import { NextRequest } from "next/server";
import { getAIModel, MODEL_CONFIG } from "@/lib/ai-provider";
import { buildSystemPrompt } from "@/lib/prompts";
import type { AnonymousUserContext } from "@/lib/user-context";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  assembleAnonymousKnowledge,
  assembleAuthenticatedKnowledge,
  formatKnowledgeForPrompt,
} from "@/lib/user-knowledge";
import type { StoredAssessment } from "@/lib/assessment-context";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support both formats:
    // Homepage: { messages: [{role, content}...], userContext?, assessmentContext? }
    // Calculator: { message: string, history: [...], calculatorContext: string, userContext? }
    const {
      messages: rawMessages,
      message: singleMessage,
      history: chatHistory,
      calculatorContext,
      userContext,
      assessmentContext,
      assessmentData,
    } = body as {
      messages?: Array<{ role: string; content: string }>;
      message?: string;
      history?: Array<{ role: string; content: string }>;
      calculatorContext?: string;
      userContext?: AnonymousUserContext;
      assessmentContext?: string;
      assessmentData?: StoredAssessment;
    };

    // Normalize messages to Vercel AI SDK format
    let messages: Array<{ role: "user" | "assistant"; content: string }>;

    if (singleMessage !== undefined) {
      // Calculator chat format
      const history = (chatHistory || []).map(
        (msg: { role: string; content: string }) => ({
          role: (msg.role === "user" ? "user" : "assistant") as
            | "user"
            | "assistant",
          content: msg.content,
        })
      );
      messages = [...history, { role: "user" as const, content: singleMessage }];
    } else {
      // Homepage chat format (already in correct format from useChat)
      messages = (rawMessages || []).map(
        (msg: { role: string; content: string }) => ({
          role: (msg.role === "user" ? "user" : "assistant") as
            | "user"
            | "assistant",
          content: msg.content,
        })
      );
    }

    // Build knowledge section based on auth state
    let knowledgeSection: string | undefined;

    // Check if user is authenticated
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Authenticated: assemble knowledge from DB (ignores client-sent userContext)
      const knowledge = await assembleAuthenticatedKnowledge(user.id);
      knowledgeSection = formatKnowledgeForPrompt(knowledge);
    } else if (userContext) {
      // Anonymous: assemble from client-sent context
      const knowledge = assembleAnonymousKnowledge(
        userContext,
        assessmentData || null
      );
      knowledgeSection = formatKnowledgeForPrompt(knowledge, assessmentData);
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt({
      calculatorContext,
      knowledgeSection,
      // Legacy fallback: if knowledgeSection wasn't built but we have raw context
      assessmentContext: knowledgeSection ? undefined : assessmentContext,
    });

    // Stream the response
    const result = await streamText({
      model: getAIModel(),
      system: systemPrompt,
      messages,
      ...MODEL_CONFIG,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    // Return a non-streaming error response
    return new Response(
      JSON.stringify({
        error:
          "I'm having trouble connecting right now. Please try again in a moment!",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
