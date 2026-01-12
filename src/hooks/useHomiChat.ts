"use client";

import { useChat } from "ai/react";
import { useCallback } from "react";
import type { ChatMessage } from "@/types";

/**
 * Hook for Homi chat functionality with streaming support.
 * Wraps Vercel AI SDK's useChat to maintain backward-compatible API.
 */
export function useHomiChat() {
  const {
    messages: aiMessages,
    isLoading,
    error,
    append,
    setMessages,
  } = useChat({
    api: "/api/chat",
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
