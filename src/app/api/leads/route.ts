import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

// Email notification configuration
const NOTIFY_EMAIL = process.env.LEAD_NOTIFY_EMAIL || "cody@tomi.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface LeadData {
  email: string;
  source: "assessment" | "calculator" | "chat" | "newsletter" | "other";
  assessmentGrade?: string;
  assessmentScore?: number;
  assessmentAnswers?: Record<string, unknown>;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}

async function sendNotificationEmail(lead: LeadData) {
  if (!RESEND_API_KEY) {
    console.log("No RESEND_API_KEY configured, skipping email notification");
    console.log("New lead:", lead);
    return;
  }

  const gradeEmoji: Record<string, string> = {
    A: "🏆",
    B: "🎯",
    C: "💡",
    D: "🧭",
  };

  const emoji = lead.assessmentGrade ? gradeEmoji[lead.assessmentGrade] || "📬" : "📬";
  const subject = lead.assessmentGrade
    ? `${emoji} New Lead: Grade ${lead.assessmentGrade} (${lead.assessmentScore}/36)`
    : `📬 New Lead from ${lead.source}`;

  const body = `
New lead captured from Tomi!

Email: ${lead.email}
Source: ${lead.source}
${lead.assessmentGrade ? `Assessment Grade: ${lead.assessmentGrade}` : ""}
${lead.assessmentScore ? `Assessment Score: ${lead.assessmentScore}/36` : ""}

${lead.utmSource ? `UTM Source: ${lead.utmSource}` : ""}
${lead.utmMedium ? `UTM Medium: ${lead.utmMedium}` : ""}
${lead.utmCampaign ? `UTM Campaign: ${lead.utmCampaign}` : ""}
${lead.referrer ? `Referrer: ${lead.referrer}` : ""}

---
Captured at: ${new Date().toISOString()}
  `.trim();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Tomi Leads <hello@livetomi.com>",
        to: [NOTIFY_EMAIL],
        subject,
        text: body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send notification email:", error);
    } else {
      console.log("Lead notification email sent to", NOTIFY_EMAIL);
    }
  } catch (error) {
    console.error("Error sending notification email:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: LeadData = await request.json();

    // Validate required fields
    if (!data.email || !data.source) {
      return NextResponse.json(
        { error: "Email and source are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Upsert the lead (update if email+source exists, insert otherwise)
    const { data: lead, error } = await supabase
      .from("leads")
      .upsert(
        {
          email: data.email.toLowerCase().trim(),
          source: data.source,
          assessment_grade: data.assessmentGrade || null,
          assessment_score: data.assessmentScore || null,
          assessment_answers: data.assessmentAnswers || null,
          utm_source: data.utmSource || null,
          utm_medium: data.utmMedium || null,
          utm_campaign: data.utmCampaign || null,
          referrer: data.referrer || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "email,source",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving lead:", error);
      return NextResponse.json(
        { error: "Failed to save lead" },
        { status: 500 }
      );
    }

    // Send notification email (don't await to not block response)
    sendNotificationEmail(data).then(async () => {
      // Mark as notified
      await supabase
        .from("leads")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", lead.id);
    });

    return NextResponse.json({ success: true, id: lead.id });
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
