import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import type { UpdateVisitorSessionInput, VisitorSession } from "@/types/user";

// Max payload size (50KB) to prevent abuse
const MAX_PAYLOAD_SIZE = 50_000;

// Allowed top-level fields for updates
const ALLOWED_UPDATE_FIELDS = new Set([
  "first_name",
  "identity_confirmed",
  "stage",
  "chat_summary",
  "chat_topics",
  "chat_sentiment",
  "volunteered_info",
  "behavior",
  "qualification_signals",
]);

// Allowed stages
const VALID_STAGES = new Set(["explorer", "evaluator", "ready", "calculated"]);

// Max string length for text fields
const MAX_STRING_LENGTH = 2000;

/**
 * POST /api/visitor
 * Create or update a visitor session (anonymous users)
 */
export async function POST(request: NextRequest) {
  try {
    // Check payload size via content-length header
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 }
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 }
      );
    }

    const body = JSON.parse(rawBody) as UpdateVisitorSessionInput;
    const { visitor_id, session_id, ...updates } = body;

    if (!visitor_id || !session_id) {
      return NextResponse.json(
        { error: "visitor_id and session_id are required" },
        { status: 400 }
      );
    }

    // Validate visitor_id and session_id format (UUIDs or reasonable strings)
    if (
      typeof visitor_id !== "string" ||
      visitor_id.length > 100 ||
      typeof session_id !== "string" ||
      session_id.length > 100
    ) {
      return NextResponse.json(
        { error: "Invalid visitor_id or session_id" },
        { status: 400 }
      );
    }

    // Strip unknown fields
    for (const key of Object.keys(updates)) {
      if (!ALLOWED_UPDATE_FIELDS.has(key)) {
        delete (updates as Record<string, unknown>)[key];
      }
    }

    // Validate stage value
    if (updates.stage && !VALID_STAGES.has(updates.stage)) {
      return NextResponse.json(
        { error: "Invalid stage value" },
        { status: 400 }
      );
    }

    // Validate string field lengths
    for (const field of ["first_name", "chat_summary", "chat_sentiment"] as const) {
      const val = updates[field];
      if (val !== undefined && (typeof val !== "string" || val.length > MAX_STRING_LENGTH)) {
        return NextResponse.json(
          { error: `${field} must be a string under ${MAX_STRING_LENGTH} chars` },
          { status: 400 }
        );
      }
    }

    const supabase = createServiceRoleClient();

    // Check if session exists
    const { data: existing } = await supabase
      .from("visitor_sessions")
      .select("id, volunteered_info, behavior")
      .eq("visitor_id", visitor_id)
      .eq("session_id", session_id)
      .single();

    if (existing) {
      // Update existing session
      const updateData: Record<string, unknown> = {
        last_seen: new Date().toISOString(),
      };

      // Merge fields
      if (updates.first_name !== undefined)
        updateData.first_name = updates.first_name;
      if (updates.identity_confirmed !== undefined)
        updateData.identity_confirmed = updates.identity_confirmed;
      if (updates.stage !== undefined) updateData.stage = updates.stage;
      if (updates.chat_summary !== undefined)
        updateData.chat_summary = updates.chat_summary;
      if (updates.chat_topics !== undefined)
        updateData.chat_topics = updates.chat_topics;
      if (updates.chat_sentiment !== undefined)
        updateData.chat_sentiment = updates.chat_sentiment;

      // Merge JSONB fields
      if (updates.volunteered_info) {
        updateData.volunteered_info = {
          ...(existing.volunteered_info || {}),
          ...updates.volunteered_info,
        };
      }
      if (updates.behavior) {
        updateData.behavior = {
          ...(existing.behavior || {}),
          ...updates.behavior,
        };
      }
      if (updates.qualification_signals) {
        updateData.qualification_signals = updates.qualification_signals;
      }

      const { data, error } = await supabase
        .from("visitor_sessions")
        .update(updateData)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ session: data });
    } else {
      // Create new session
      const { data, error } = await supabase
        .from("visitor_sessions")
        .insert({
          visitor_id,
          session_id,
          first_name: updates.first_name || null,
          identity_confirmed: updates.identity_confirmed || false,
          stage: updates.stage || "explorer",
          volunteered_info: updates.volunteered_info || {},
          behavior: updates.behavior || {
            pagesVisited: [],
            calculatorStarted: false,
            calculatorCompleted: false,
            chatMessagesCount: 0,
            topicsDiscussed: [],
            sessionCount: 1,
          },
          chat_summary: updates.chat_summary || null,
          chat_topics: updates.chat_topics || null,
          chat_sentiment: updates.chat_sentiment || null,
          qualification_signals: updates.qualification_signals || {},
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ session: data }, { status: 201 });
    }
  } catch (error) {
    console.error("Visitor session error:", error);
    return NextResponse.json(
      { error: "Failed to update visitor session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/visitor?visitor_id=xxx
 * Get visitor session history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitor_id");

    if (!visitorId) {
      return NextResponse.json(
        { error: "visitor_id is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("visitor_sessions")
      .select("*")
      .eq("visitor_id", visitorId)
      .order("last_seen", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw error;
    }

    return NextResponse.json({ session: data as VisitorSession | null });
  } catch (error) {
    console.error("Visitor fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitor session" },
      { status: 500 }
    );
  }
}
