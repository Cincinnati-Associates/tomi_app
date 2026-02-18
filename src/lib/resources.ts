/**
 * Tomi Resource Catalog
 *
 * Central registry of all tools, guides, and resources that Homi can link to.
 * Add new resources here and they'll automatically appear in Homi's context.
 */

export type ResourceCategory = "tool" | "guide" | "assessment" | "booking" | "exercise";

export interface Resource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: ResourceCategory;
  /** Keywords/phrases that should trigger this resource suggestion */
  triggers: string[];
  /** Is this resource currently live? False = "coming soon" */
  available: boolean;
  /**
   * Priority order (1 = highest). Homi should work through resources
   * in this order during a conversation, promoting higher-priority
   * resources first before moving to lower-priority ones.
   */
  priority: number;
  /** Why this resource matters — helps Homi explain the value to users */
  valueProp: string;
}

/**
 * Resources listed in priority order. Homi should guide users through
 * these sequentially — promote #1 first, then #2 once #1 is done, etc.
 */
export const TOMI_RESOURCES: Resource[] = [
  // === PRIORITY 1: Readiness Assessment ===
  {
    id: "assessment",
    name: "Co-Ownership Readiness Assessment",
    description: "A quick quiz that tells you if co-ownership is right for you, right now",
    url: "/assessment",
    category: "assessment",
    triggers: [
      "am I ready",
      "is this right for me",
      "should I co-own",
      "good fit",
      "evaluate",
      "ready for co-ownership",
      "qualify",
    ],
    available: true,
    priority: 1,
    valueProp: "Takes 2 minutes. Gives you a personalized readiness grade (A-D) and tells you exactly what to focus on next. No account required.",
  },

  // === PRIORITY 2: Co-Buying Calculator ===
  {
    id: "calculator",
    name: "Co-Buying Power Calculator",
    description: "See exactly how much more home you could afford with co-buyers",
    url: "/calc",
    category: "tool",
    triggers: [
      "affordability",
      "how much can I afford",
      "buying power",
      "budget",
      "price range",
      "what can we afford",
      "numbers",
      "monthly payment",
    ],
    available: true,
    priority: 2,
    valueProp: "Plug in your numbers and see the real math — what you can afford alone vs. with co-buyers. Makes it concrete.",
  },

  // === PRIORITY 3: Create Account ===
  {
    id: "signup",
    name: "Create a Free Account",
    description: "Save your progress, get personalized guidance, and start your co-ownership journey",
    url: "/?signin=true",
    category: "tool",
    triggers: [
      "sign up",
      "create account",
      "save my results",
      "save progress",
      "remember me",
      "next steps",
      "get started",
    ],
    available: true,
    priority: 3,
    valueProp: "Saves your assessment, exercise results, and calculator scenarios. Unlocks personalized readiness exercises and lets you start a buying party when ready. Free, no commitment.",
  },

  // === PRIORITY 4: Readiness Exercises ===
  {
    id: "exercises",
    name: "Readiness Exercises",
    description: "Short exercises that build your readiness score and prepare you for co-ownership",
    url: "/dashboard",
    category: "exercise",
    triggers: [
      "exercises",
      "financial readiness",
      "housing preferences",
      "timeline",
      "get prepared",
      "improve my score",
      "readiness score",
    ],
    available: true,
    priority: 4,
    valueProp: "Four focused exercises covering finances, housing preferences, lifestyle compatibility, and timeline. Each takes 5-8 minutes and builds your readiness score. Requires an account.",
  },

  // === PRIORITY 5: Co-Ownership History ===
  {
    id: "story",
    name: "The Story of Co-Ownership",
    description: "An interactive visual history of how people have always owned homes together",
    url: "/co-ownership-history",
    category: "guide",
    triggers: [
      "history",
      "how common is this",
      "is this new",
      "co-ownership history",
      "has this been done before",
    ],
    available: true,
    priority: 5,
    valueProp: "Co-ownership isn't new — it's how communities have built wealth for centuries. This interactive story shows you the rich history.",
  },

  // === PRIORITY 6: Start a Buying Party ===
  {
    id: "buying-party",
    name: "Start a Buying Party",
    description: "Invite your co-buyers and begin aligning on goals, budget, and preferences",
    url: "/parties",
    category: "tool",
    triggers: [
      "start a group",
      "invite co-buyers",
      "buying party",
      "we want to buy together",
      "form a group",
      "my group",
    ],
    available: true,
    priority: 6,
    valueProp: "When you have co-buyers in mind, start a buying party to get everyone aligned. Your group gets a dedicated Homi that knows your situation inside and out. Requires an account.",
  },

  // === PRIORITY 7: TIC Agreement Builder (Coming Soon) ===
  {
    id: "tic-builder",
    name: "TIC Agreement Builder",
    description: "Interactive tool to draft your tenants-in-common agreement terms",
    url: "/tic-builder",
    category: "tool",
    triggers: [
      "agreement",
      "contract",
      "legal document",
      "TIC agreement",
      "terms",
      "draft agreement",
    ],
    available: false,
    priority: 7,
    valueProp: "Build your co-ownership agreement step by step — covering equity splits, decision-making, exit rules, and more.",
  },

  // === PRIORITY 8: Schedule a Consultation (Coming Soon) ===
  {
    id: "consultation",
    name: "Schedule a Consultation",
    description: "Talk to a Tomi co-ownership specialist",
    url: "/book-consultation",
    category: "booking",
    triggers: [
      "talk to someone",
      "speak with",
      "consultation",
      "schedule a call",
      "human help",
      "real person",
    ],
    available: false,
    priority: 8,
    valueProp: "Speak directly with a co-ownership specialist who can answer specific questions about your situation.",
  },
];

/** Get all available resources */
export function getAvailableResources(): Resource[] {
  return TOMI_RESOURCES.filter((r) => r.available);
}

/** Get resources by category */
export function getResourcesByCategory(
  category: ResourceCategory
): Resource[] {
  return TOMI_RESOURCES.filter((r) => r.category === category && r.available);
}

/** Format resources for prompt injection */
export function formatResourcesForPrompt(currentPage?: string): string {
  const sorted = [...TOMI_RESOURCES].sort((a, b) => a.priority - b.priority);
  const available = sorted.filter((r) => r.available);
  const comingSoon = sorted.filter((r) => !r.available);

  // Check if the user is currently on a resource page
  const isOnResourcePage = currentPage
    ? available.some((r) => currentPage.startsWith(r.url))
    : false;

  let prompt = `## Resources & Recommended Journey (Priority Order)
You have a set of resources to guide users through. Work through them **in priority order** — promote the highest-priority resource the user hasn't engaged with yet. Track what they've already done (assessment completed, calculator used, account created) from the conversation context and move to the next one.

**The ideal user journey:**
1. Take the readiness assessment → 2. Try the calculator → 3. Create an account → 4. Complete exercises → 5. Explore co-ownership history → 6. Start a buying party

`;

  for (const r of available) {
    const isCurrentPage = currentPage ? currentPage.startsWith(r.url) : false;
    prompt += `### ${r.priority}. ${r.name} (${r.url})`;
    if (isCurrentPage) {
      prompt += ` ⚠️ USER IS CURRENTLY ON THIS PAGE — DO NOT PROMOTE`;
    }
    prompt += `\n`;
    prompt += `${r.description}\n`;
    prompt += `**Why it matters**: ${r.valueProp}\n`;
    prompt += `**Suggest when**: ${r.triggers.slice(0, 4).join(", ")}\n\n`;
  }

  if (comingSoon.length > 0) {
    prompt += `### Coming Soon (mention interest but don't link)\n`;
    for (const r of comingSoon) {
      prompt += `- **${r.name}**: ${r.description}. ${r.valueProp}\n`;
    }
    prompt += "\n";
  }

  prompt += `## Linking Guidelines
- Link naturally within your response using markdown: [Link Text](url)`;

  if (isOnResourcePage) {
    prompt += `\n- **The user is already engaged in an exercise/resource. Do NOT suggest other resources unless they explicitly ask. Focus on helping them with what they're currently doing.**`;
  } else {
    prompt += `\n- Only suggest **ONE primary resource per response** — the highest-priority one they haven't done yet`;
  }

  prompt += `
- If the user has already completed a resource (e.g., assessment context is present), skip it and promote the next one
- For "coming soon" resources, acknowledge interest: "We're building that right now — in the meantime, [next available resource]"
- Always explain WHY the resource is valuable, don't just drop a link
`;

  return prompt;
}
