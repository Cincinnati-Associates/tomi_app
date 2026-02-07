"use client";

import { useChat } from "ai/react";

export function useAdminHomiChat(targetUserId: string) {
  const chat = useChat({
    api: "/api/admin/chat",
    body: { targetUserId },
  });

  return {
    messages: chat.messages,
    input: chat.input,
    handleInputChange: chat.handleInputChange,
    handleSubmit: chat.handleSubmit,
    isLoading: chat.isLoading,
    setMessages: chat.setMessages,
  };
}
