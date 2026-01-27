/**
 * Anonymous User Context System
 *
 * Stores user data in localStorage for personalized experience pre-signup.
 * Privacy-first: Only first name + bucketed/volunteered data, no sensitive PII.
 */

// Storage key for localStorage
const STORAGE_KEY = "tomi_visitor_context";

/**
 * User's journey stage through the co-ownership exploration
 */
export type UserStage = "explorer" | "evaluator" | "ready" | "calculated";

/**
 * Topics that can be tracked from conversations
 */
export type ConversationTopic =
  | "tic-basics"
  | "exit-strategy"
  | "credit-concerns"
  | "payment-issues"
  | "disagreements"
  | "legal-questions"
  | "finding-cobuyers"
  | "timeline"
  | "location"
  | "pricing";

/**
 * User identity (first name only, captured through conversation)
 */
export interface UserIdentity {
  firstName?: string;
  confirmedIdentity: boolean; // User confirmed "Yes, I'm [name]" on return visit
}

/**
 * Information the user has volunteered through conversation
 */
export interface VolunteeredInfo {
  metroArea?: string; // "Bay Area", "Austin", etc. - not specific addresses
  incomeRange?: string; // Bucketed: "50-75k", "100-150k", etc.
  coBuyerCount?: number; // 2-5
  timeline?: string; // "ASAP", "3-6 months", "6-12 months", "1+ year", "just exploring"
  hasSpecificCoBuyers?: boolean;
}

/**
 * Behavioral tracking (non-PII)
 */
export interface UserBehavior {
  pagesVisited: string[];
  calculatorStarted: boolean;
  calculatorCompleted: boolean;
  chatMessagesCount: number;
  topicsDiscussed: ConversationTopic[];
  sessionCount: number;
}

/**
 * Full anonymous user context
 */
export interface AnonymousUserContext {
  visitorId: string; // Persistent UUID across sessions
  sessionId: string; // Per-session UUID
  firstSeen: string; // ISO timestamp
  lastSeen: string; // ISO timestamp
  stage: UserStage;
  identity: UserIdentity;
  volunteered: VolunteeredInfo;
  behavior: UserBehavior;
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a fresh context for new visitors
 */
export function createNewContext(): AnonymousUserContext {
  const now = new Date().toISOString();
  return {
    visitorId: generateUUID(),
    sessionId: generateUUID(),
    firstSeen: now,
    lastSeen: now,
    stage: "explorer",
    identity: {
      firstName: undefined,
      confirmedIdentity: false,
    },
    volunteered: {},
    behavior: {
      pagesVisited: [],
      calculatorStarted: false,
      calculatorCompleted: false,
      chatMessagesCount: 0,
      topicsDiscussed: [],
      sessionCount: 1,
    },
  };
}

/**
 * Load context from localStorage
 * Returns null if no context exists or if we're on the server
 */
export function loadContext(): AnonymousUserContext | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const context = JSON.parse(stored) as AnonymousUserContext;

    // Validate structure (basic check)
    if (!context.visitorId || !context.sessionId) {
      return null;
    }

    return context;
  } catch {
    // Corrupted data, return null
    return null;
  }
}

/**
 * Save context to localStorage
 */
export function saveContext(context: AnonymousUserContext): void {
  if (typeof window === "undefined") return;

  try {
    context.lastSeen = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  } catch {
    // localStorage full or disabled, fail silently
  }
}

/**
 * Clear context from localStorage
 */
export function clearContext(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // fail silently
  }
}

/**
 * Get or create context for current visitor
 * Handles returning visitors by creating new session but preserving visitor ID
 */
export function getOrCreateContext(): AnonymousUserContext {
  const existing = loadContext();

  if (existing) {
    // Check if this is a new session (more than 30 minutes since last seen)
    const lastSeen = new Date(existing.lastSeen);
    const now = new Date();
    const minutesSinceLastSeen =
      (now.getTime() - lastSeen.getTime()) / (1000 * 60);

    if (minutesSinceLastSeen > 30) {
      // New session for returning visitor
      const updated: AnonymousUserContext = {
        ...existing,
        sessionId: generateUUID(),
        lastSeen: now.toISOString(),
        identity: {
          ...existing.identity,
          confirmedIdentity: false, // Reset confirmation for new session
        },
        behavior: {
          ...existing.behavior,
          sessionCount: existing.behavior.sessionCount + 1,
        },
      };
      saveContext(updated);
      return updated;
    }

    // Same session, just update lastSeen
    existing.lastSeen = now.toISOString();
    saveContext(existing);
    return existing;
  }

  // New visitor
  const newContext = createNewContext();
  saveContext(newContext);
  return newContext;
}

/**
 * Update user identity
 */
export function updateIdentity(
  context: AnonymousUserContext,
  updates: Partial<UserIdentity>
): AnonymousUserContext {
  const updated = {
    ...context,
    identity: { ...context.identity, ...updates },
  };
  saveContext(updated);
  return updated;
}

/**
 * Update volunteered information
 */
export function updateVolunteered(
  context: AnonymousUserContext,
  updates: Partial<VolunteeredInfo>
): AnonymousUserContext {
  const updated = {
    ...context,
    volunteered: { ...context.volunteered, ...updates },
  };
  saveContext(updated);
  return updated;
}

/**
 * Update user stage
 */
export function updateStage(
  context: AnonymousUserContext,
  stage: UserStage
): AnonymousUserContext {
  const updated = { ...context, stage };
  saveContext(updated);
  return updated;
}

/**
 * Track a page visit
 */
export function trackPageVisit(
  context: AnonymousUserContext,
  page: string
): AnonymousUserContext {
  const pages = [...context.behavior.pagesVisited];
  if (!pages.includes(page)) {
    pages.push(page);
  }
  const updated = {
    ...context,
    behavior: { ...context.behavior, pagesVisited: pages },
  };
  saveContext(updated);
  return updated;
}

/**
 * Track calculator progress
 */
export function trackCalculator(
  context: AnonymousUserContext,
  completed: boolean
): AnonymousUserContext {
  const updated = {
    ...context,
    stage: completed ? ("calculated" as UserStage) : context.stage,
    behavior: {
      ...context.behavior,
      calculatorStarted: true,
      calculatorCompleted: completed,
    },
  };
  saveContext(updated);
  return updated;
}

/**
 * Track a conversation topic
 */
export function trackTopic(
  context: AnonymousUserContext,
  topic: ConversationTopic
): AnonymousUserContext {
  const topics = [...context.behavior.topicsDiscussed];
  if (!topics.includes(topic)) {
    topics.push(topic);
  }
  const updated = {
    ...context,
    behavior: { ...context.behavior, topicsDiscussed: topics },
  };
  saveContext(updated);
  return updated;
}

/**
 * Increment chat message count
 */
export function incrementChatCount(
  context: AnonymousUserContext
): AnonymousUserContext {
  const updated = {
    ...context,
    behavior: {
      ...context.behavior,
      chatMessagesCount: context.behavior.chatMessagesCount + 1,
    },
  };
  saveContext(updated);
  return updated;
}

/**
 * Clear first name (when user denies identity on return)
 */
export function clearFirstName(
  context: AnonymousUserContext
): AnonymousUserContext {
  const updated = {
    ...context,
    identity: {
      firstName: undefined,
      confirmedIdentity: false,
    },
  };
  saveContext(updated);
  return updated;
}

/**
 * Infer stage from context
 */
export function inferStage(context: AnonymousUserContext): UserStage {
  // Already calculated
  if (context.behavior.calculatorCompleted) {
    return "calculated";
  }

  // Has specific co-buyers and timeline = ready
  if (
    context.volunteered.hasSpecificCoBuyers &&
    context.volunteered.timeline &&
    context.volunteered.timeline !== "just exploring"
  ) {
    return "ready";
  }

  // Has asked about specific scenarios or has some volunteered info = evaluator
  if (
    context.behavior.topicsDiscussed.length > 2 ||
    context.volunteered.metroArea ||
    context.volunteered.coBuyerCount
  ) {
    return "evaluator";
  }

  // Default
  return "explorer";
}

/**
 * Prepare context for API (remove any sensitive fields if needed)
 */
export function contextForAPI(
  context: AnonymousUserContext
): AnonymousUserContext {
  // Currently we send everything, but this is where we'd filter
  // if we add any client-only fields
  return context;
}
