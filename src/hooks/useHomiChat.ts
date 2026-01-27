"use client";

import { useChat } from "ai/react";
import { useCallback, useMemo } from "react";
import type { ChatMessage } from "@/types";
import type { AnonymousUserContext } from "@/lib/user-context";

interface UseHomiChatOptions {
  userContext?: AnonymousUserContext | null;
}

/**
 * Hook for Homi chat functionality with streaming support.
 * Wraps Vercel AI SDK's useChat to maintain backward-compatible API.
 */
export function useHomiChat(options: UseHomiChatOptions = {}) {
  const { userContext } = options;

  // Memoize the body to avoid re-renders
  const body = useMemo(
    () => (userContext ? { userContext } : undefined),
    [userContext]
  );

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
