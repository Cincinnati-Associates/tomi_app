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
import {
  createRateLimiter,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";

const checkRateLimit = createRateLimiter({ name: "chat" });

const MAX_MESSAGES = 50;
const MAX_CHARS_PER_MESSAGE = 8000;
const VALID_ROLES = new Set(["user", "assistant", "system"]);

function validateMessages(
  msgs: Array<{ role: string; content: string }> | undefined
): string | null {
  if (!msgs) return null;
  if (!Array.isArray(msgs)) return "messages must be an array";
  if (msgs.length > MAX_MESSAGES)
    return `Too many messages (max ${MAX_MESSAGES})`;
  for (const msg of msgs) {
    if (!VALID_ROLES.has(msg.role))
      return `Invalid message role: ${msg.role}`;
    if (typeof msg.content !== "string") return "Message content must be a string";
    if (msg.content.length > MAX_CHARS_PER_MESSAGE)
      return `Message too long (max ${MAX_CHARS_PER_MESSAGE} characters)`;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit check — get auth state first for user-based limits
    const ip = getClientIp(request);
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const rl = checkRateLimit({ userId: user?.id, ip });
    if (!rl.success) return rateLimitResponse(rl);

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
      currentPage,
    } = body as {
      messages?: Array<{ role: string; content: string }>;
      message?: string;
      history?: Array<{ role: string; content: string }>;
      calculatorContext?: string;
      userContext?: AnonymousUserContext;
      assessmentContext?: string;
      assessmentData?: StoredAssessment;
      currentPage?: string;
    };

    // --- Input validation ---
    // Validate both message formats
    const msgError = validateMessages(rawMessages) || validateMessages(chatHistory);
    if (msgError) {
      return new Response(JSON.stringify({ error: msgError }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (
      singleMessage !== undefined &&
      (typeof singleMessage !== "string" ||
        singleMessage.length > MAX_CHARS_PER_MESSAGE)
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid or oversized message" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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

    if (user) {
      // Authenticated: assemble knowledge from DB (ignores client-sent userContext)
      const knowledge = await assembleAuthenticatedKnowledge(user.id);
      knowledgeSection = formatKnowledgeForPrompt(knowledge);
    } else if (userContext) {
      // Anonymous: assemble from client-sent context
      console.log("[DEBUG] assembleAnonymousKnowledge input:", { hasUserContext: !!userContext, hasAssessment: !!assessmentData });
      try {
        const knowledge = assembleAnonymousKnowledge(
          userContext,
          assessmentData || null
        );
        console.log("[DEBUG] assembleAnonymousKnowledge OK");
        knowledgeSection = formatKnowledgeForPrompt(knowledge, assessmentData);
        console.log("[DEBUG] formatKnowledgeForPrompt OK, length:", knowledgeSection?.length);
      } catch (innerErr) {
        console.error("[DEBUG] Knowledge assembly crashed:", innerErr);
        throw innerErr;
      }
    }

    // Build system prompt
    console.log("[DEBUG] Building system prompt...");
    const systemPrompt = buildSystemPrompt({
      calculatorContext,
      knowledgeSection,
      // Legacy fallback: if knowledgeSection wasn't built but we have raw context
      assessmentContext: knowledgeSection ? undefined : assessmentContext,
      currentPage,
    });
    console.log("[DEBUG] System prompt built, length:", systemPrompt.length);

    // Stream the response with smoothed pacing for readability
    console.log("[DEBUG] Calling streamText...");
    const result = await streamText({
      model: getAIModel(),
      system: systemPrompt,
      messages,
      ...MODEL_CONFIG,
    });
    console.log("[DEBUG] streamText returned OK");

    const response = result.toDataStreamResponse();

    // Slow down the stream slightly so text appears at a readable pace.
    // Each SSE chunk is delayed by CHUNK_DELAY_MS before being forwarded.
    const CHUNK_DELAY_MS = 18;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const smoothed = new TransformStream<Uint8Array, Uint8Array>({
      async transform(chunk, controller) {
        await delay(CHUNK_DELAY_MS);
        controller.enqueue(chunk);
      },
    });

    return new Response(response.body!.pipeThrough(smoothed), {
      headers: response.headers,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    // Temp debug: write error details to file
    const fs = await import("fs");
    try {
      fs.writeFileSync("/tmp/chat-api-error.txt", `${new Date().toISOString()}\n${error instanceof Error ? `${error.message}\n${error.stack}` : JSON.stringify(error)}\n`);
    } catch {}

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
