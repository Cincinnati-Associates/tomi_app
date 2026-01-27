"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  AnonymousUserContext,
  UserStage,
  VolunteeredInfo,
  ConversationTopic,
  getOrCreateContext,
  updateIdentity,
  updateVolunteered,
  updateStage,
  trackPageVisit,
  trackCalculator,
  trackTopic,
  incrementChatCount,
  clearFirstName,
  inferStage,
  contextForAPI,
  clearContext as clearStoredContext,
} from "@/lib/user-context";
import { useVisitorPersistence } from "./useVisitorPersistence";

/**
 * React hook for managing anonymous user context
 * Provides access to user context and methods to update it
 * Now syncs to Supabase for cross-device continuity
 */
export function useAnonymousContext() {
  const [context, setContext] = useState<AnonymousUserContext | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { syncToSupabase, syncChatSummary, linkToUser } = useVisitorPersistence();
  const lastSyncRef = useRef<string | null>(null);

  // Load context on mount (client-side only)
  useEffect(() => {
    const ctx = getOrCreateContext();
    setContext(ctx);
    setIsLoaded(true);
  }, []);

  // Track current page
  useEffect(() => {
    if (!context || typeof window === "undefined") return;

    const page = window.location.pathname;
    const updated = trackPageVisit(context, page);
    setContext(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]); // Only run once after initial load

  // Sync context changes to Supabase (debounced)
  useEffect(() => {
    if (!context || !isLoaded) return;

    // Create a hash of important fields to detect meaningful changes
    const contextHash = JSON.stringify({
      firstName: context.identity.firstName,
      stage: context.stage,
      volunteered: context.volunteered,
      chatCount: context.behavior.chatMessagesCount,
      topics: context.behavior.topicsDiscussed,
    });

    // Only sync if something meaningful changed
    if (contextHash !== lastSyncRef.current) {
      lastSyncRef.current = contextHash;
      syncToSupabase(context);
    }
  }, [context, isLoaded, syncToSupabase]);

  /**
   * Set the user's first name
   */
  const setFirstName = useCallback(
    (firstName: string) => {
      if (!context) return;
      const updated = updateIdentity(context, { firstName });
      setContext(updated);
    },
    [context]
  );

  /**
   * Confirm identity on returning visit
   */
  const confirmIdentity = useCallback(
    (confirmed: boolean) => {
      if (!context) return;
      if (confirmed) {
        const updated = updateIdentity(context, { confirmedIdentity: true });
        setContext(updated);
      } else {
        // User said "that's not me" - clear the name
        const updated = clearFirstName(context);
        setContext(updated);
      }
    },
    [context]
  );

  /**
   * Update volunteered information
   */
  const setVolunteered = useCallback(
    (info: Partial<VolunteeredInfo>) => {
      if (!context) return;
      const updated = updateVolunteered(context, info);
      // Re-infer stage based on new info
      const newStage = inferStage(updated);
      if (newStage !== updated.stage) {
        const withStage = updateStage(updated, newStage);
        setContext(withStage);
      } else {
        setContext(updated);
      }
    },
    [context]
  );

  /**
   * Manually set user stage
   */
  const setStage = useCallback(
    (stage: UserStage) => {
      if (!context) return;
      const updated = updateStage(context, stage);
      setContext(updated);
    },
    [context]
  );

  /**
   * Track that the calculator was started/completed
   */
  const onCalculatorProgress = useCallback(
    (completed: boolean) => {
      if (!context) return;
      const updated = trackCalculator(context, completed);
      setContext(updated);
    },
    [context]
  );

  /**
   * Track a conversation topic
   */
  const onTopicDiscussed = useCallback(
    (topic: ConversationTopic) => {
      if (!context) return;
      const updated = trackTopic(context, topic);
      setContext(updated);
    },
    [context]
  );

  /**
   * Increment chat message count
   */
  const onChatMessage = useCallback(() => {
    if (!context) return;
    const updated = incrementChatCount(context);
    setContext(updated);
  }, [context]);

  /**
   * Clear all context (for testing or user request)
   */
  const clearContext = useCallback(() => {
    clearStoredContext();
    const fresh = getOrCreateContext();
    setContext(fresh);
  }, []);

  /**
   * Get context formatted for API calls
   */
  const getContextForAPI = useCallback(() => {
    if (!context) return null;
    return contextForAPI(context);
  }, [context]);

  /**
   * Check if this is a returning user who needs identity confirmation
   */
  const needsIdentityConfirmation = useCallback(() => {
    if (!context) return false;
    return (
      context.identity.firstName &&
      !context.identity.confirmedIdentity &&
      context.behavior.sessionCount > 1
    );
  }, [context]);

  /**
   * Save chat summary to Supabase (call when conversation ends)
   */
  const saveChatSummary = useCallback(
    async (summary: {
      chatSummary?: string;
      chatTopics?: string[];
      chatSentiment?: "positive" | "neutral" | "cautious" | "skeptical";
      qualificationSignals?: Record<string, unknown>;
    }) => {
      if (!context) return;
      await syncChatSummary(context, summary);
    },
    [context, syncChatSummary]
  );

  /**
   * Link this visitor to an authenticated user (call on signup)
   */
  const linkVisitorToUser = useCallback(async () => {
    if (!context) return null;
    return await linkToUser(context.visitorId);
  }, [context, linkToUser]);

  return {
    // State
    context,
    isLoaded,

    // Identity
    setFirstName,
    confirmIdentity,
    needsIdentityConfirmation,

    // Qualification
    setVolunteered,
    setStage,

    // Behavior tracking
    onCalculatorProgress,
    onTopicDiscussed,
    onChatMessage,

    // Persistence
    saveChatSummary,
    linkVisitorToUser,

    // Utilities
    clearContext,
    getContextForAPI,
  };
}
