"use client";

import { useCallback, useRef } from "react";
import type { AnonymousUserContext } from "@/lib/user-context";
import type { UpdateVisitorSessionInput } from "@/types/user";

/**
 * Hook for persisting visitor session data to Supabase
 * Debounces updates to avoid excessive API calls
 */
export function useVisitorPersistence() {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Partial<UpdateVisitorSessionInput>>({});

  /**
   * Sync visitor context to Supabase (debounced)
   */
  const syncToSupabase = useCallback(
    async (context: AnonymousUserContext) => {
      // Build the update payload
      const update: UpdateVisitorSessionInput = {
        visitor_id: context.visitorId,
        session_id: context.sessionId,
        first_name: context.identity.firstName || undefined,
        identity_confirmed: context.identity.confirmedIdentity,
        stage: context.stage,
        volunteered_info: context.volunteered,
        behavior: context.behavior,
      };

      // Merge with pending updates
      pendingUpdatesRef.current = {
        ...pendingUpdatesRef.current,
        ...update,
      };

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the API call (wait 2 seconds after last update)
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const payload = pendingUpdatesRef.current;
          pendingUpdatesRef.current = {};

          await fetch("/api/visitor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch (error) {
          console.error("Failed to sync visitor session:", error);
        }
      }, 2000);
    },
    []
  );

  /**
   * Sync chat summary and analytics (called after conversation ends or periodically)
   */
  const syncChatSummary = useCallback(
    async (
      context: AnonymousUserContext,
      summary: {
        chatSummary?: string;
        chatTopics?: string[];
        chatSentiment?: "positive" | "neutral" | "cautious" | "skeptical";
        qualificationSignals?: Record<string, unknown>;
      }
    ) => {
      try {
        await fetch("/api/visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitor_id: context.visitorId,
            session_id: context.sessionId,
            chat_summary: summary.chatSummary,
            chat_topics: summary.chatTopics,
            chat_sentiment: summary.chatSentiment,
            qualification_signals: summary.qualificationSignals,
          }),
        });
      } catch (error) {
        console.error("Failed to sync chat summary:", error);
      }
    },
    []
  );

  /**
   * Link visitor to user after signup
   */
  const linkToUser = useCallback(async (visitorId: string) => {
    try {
      const response = await fetch("/api/visitor/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitor_id: visitorId }),
      });

      if (!response.ok) {
        throw new Error("Failed to link visitor");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to link visitor to user:", error);
      return null;
    }
  }, []);

  return {
    syncToSupabase,
    syncChatSummary,
    linkToUser,
  };
}
