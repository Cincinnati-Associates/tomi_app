import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "@/lib/supabase-server";

/**
 * POST /api/visitor/link
 * Link an anonymous visitor to an authenticated user (called on signup)
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

    const body = await request.json();
    const { visitor_id } = body as { visitor_id: string };

    if (!visitor_id) {
      return NextResponse.json(
        { error: "visitor_id is required" },
        { status: 400 }
      );
    }

    // Use service role to call the merge function
    const serviceClient = createServiceRoleClient();

    const { error } = await serviceClient.rpc("merge_visitor_to_user", {
      p_visitor_id: visitor_id,
      p_user_id: user.id,
    });

    if (error) throw error;

    // Fetch the link record to return
    const { data: link } = await serviceClient
      .from("visitor_user_links")
      .select("*")
      .eq("visitor_id", visitor_id)
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      success: true,
      link,
      message: "Visitor history linked to account",
    });
  } catch (error) {
    console.error("Visitor link error:", error);
    return NextResponse.json(
      { error: "Failed to link visitor to user" },
      { status: 500 }
    );
  }
}
