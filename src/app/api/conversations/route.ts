import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { CreateConversationInput, ChatConversation } from "@/types/user";

/**
 * POST /api/conversations
 * Create a new chat conversation (authenticated users only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateConversationInput;

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: user.id,
        party_id: body.party_id || null,
        title: body.title || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ conversation: data as ChatConversation }, { status: 201 });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversations
 * List conversations for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("include_archived") === "true";
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    let query = supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false })
      .limit(limit);

    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ conversations: data as ChatConversation[] });
  } catch (error) {
    console.error("List conversations error:", error);
    return NextResponse.json(
      { error: "Failed to list conversations" },
      { status: 500 }
    );
  }
}
