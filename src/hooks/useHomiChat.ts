"use client";

import { useChat } from "ai/react";
import { useCallback, useMemo, useEffect, useState } from "react";
import type { ChatMessage } from "@/types";
import type { AnonymousUserContext } from "@/lib/user-context";
import { getStoredAssessment, buildAssessmentContextForHomi, type StoredAssessment } from "@/lib/assessment-context";

interface UseHomiChatOptions {
  userContext?: AnonymousUserContext | null;
  /** When true, skip sending userContext in the body (server fetches it from DB) */
  isAuthenticated?: boolean;
  /** Current page path — tells Homi not to promote resources the user is already on */
  currentPage?: string;
}

/**
 * Hook for Homi chat functionality with streaming support.
 * Wraps Vercel AI SDK's useChat to maintain backward-compatible API.
 *
 * For authenticated users, the server-side chat route fetches UserKnowledge
 * from the database directly, so we don't send userContext in the body.
 * For anonymous users, we send the client-side context as before.
 */
export function useHomiChat(options: UseHomiChatOptions = {}) {
  const { userContext, isAuthenticated = false, currentPage } = options;
  const [assessmentContext, setAssessmentContext] = useState<StoredAssessment | null>(null);

  // Load assessment context on mount
  useEffect(() => {
    const stored = getStoredAssessment();
    if (stored) {
      setAssessmentContext(stored);
    }
  }, []);

  // Memoize the body to avoid re-renders
  const body = useMemo(() => {
    const bodyData: Record<string, unknown> = {};

    if (!isAuthenticated && userContext) {
      // Anonymous: send context from client
      bodyData.userContext = userContext;
    }

    if (assessmentContext) {
      if (!isAuthenticated) {
        // Anonymous: send both the formatted text and raw data
        bodyData.assessmentContext = buildAssessmentContextForHomi(assessmentContext);
        bodyData.assessmentData = assessmentContext;
      }
      // Authenticated: server has assessment data via visitor_user_links.merged_context
    }

    if (currentPage) {
      bodyData.currentPage = currentPage;
    }

    return Object.keys(bodyData).length > 0 ? bodyData : undefined;
  }, [userContext, assessmentContext, isAuthenticated, currentPage]);

  const {
    messages: aiMessages,
    isLoading,
    error,
    append,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body,
  });

  // Convert Vercel AI SDK messages to our ChatMessage format
  const messages: ChatMessage[] = aiMessages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    timestamp: new Date(),
  }));

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      await append({ role: "user", content: content.trim() });
    },
    [append]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  return {
    messages,
    isLoading,
    error: error?.message || null,
    sendMessage,
    clearChat,
  };
}
