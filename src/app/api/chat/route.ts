import { streamText } from "ai";
import { NextRequest } from "next/server";
import { getAIModel, MODEL_CONFIG } from "@/lib/ai-provider";
import { buildSystemPrompt } from "@/lib/prompts";
import type { AnonymousUserContext } from "@/lib/user-context";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support both formats:
    // Homepage: { messages: [{role, content}...], userContext?: AnonymousUserContext }
    // Calculator: { message: string, history: [...], calculatorContext: string, userContext?: AnonymousUserContext }
    const {
      messages: rawMessages,
      message: singleMessage,
      history: chatHistory,
      calculatorContext,
      userContext,
    } = body as {
      messages?: Array<{ role: string; content: string }>;
      message?: string;
      history?: Array<{ role: string; content: string }>;
      calculatorContext?: string;
      userContext?: AnonymousUserContext;
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

    // Build system prompt with user context and optional calculator context
    const systemPrompt = buildSystemPrompt({
      calculatorContext,
      userContext,
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
