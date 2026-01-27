/**
 * Tomi Resource Catalog
 *
 * Central registry of all tools, guides, and resources that Homi can link to.
 * Add new resources here and they'll automatically appear in Homi's context.
 */

export type ResourceCategory = "tool" | "guide" | "assessment" | "booking";

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
}

export const TOMI_RESOURCES: Resource[] = [
  // === TOOLS ===
  {
    id: "calculator",
    name: "Co-Buying Power Calculator",
    description: "Calculate how much more home you could afford with co-buyers",
    url: "/calculator",
    category: "tool",
    triggers: [
      "affordability",
      "how much can I afford",
      "buying power",
      "budget",
      "price range",
      "what can we afford",
    ],
    available: true,
  },
  {
    id: "assessment",
    name: "Co-Ownership Readiness Assessment",
    description: "Evaluate if co-ownership is right for your situation",
    url: "/assessment",
    category: "assessment",
    triggers: [
      "am I ready",
      "is this right for me",
      "should I co-own",
      "good fit",
      "evaluate",
      "ready for co-ownership",
    ],
    available: true,
  },
  {
    id: "tic-builder",
    name: "TIC Agreement Builder",
    description:
      "Interactive tool to draft your tenants-in-common agreement terms",
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
  },

  // === GUIDES ===
  {
    id: "guide-tic-basics",
    name: "TIC 101: Understanding Tenants-in-Common",
    description: "Everything you need to know about TIC ownership structure",
    url: "/guides/tic-basics",
    category: "guide",
    triggers: [
      "what is TIC",
      "tenants in common",
      "how does it work",
      "explain TIC",
      "TIC structure",
    ],
    available: false,
  },
  {
    id: "guide-exit-strategies",
    name: "Exit Strategies Guide",
    description: "What happens when someone wants to sell their share",
    url: "/guides/exit-strategies",
    category: "guide",
    triggers: [
      "sell my share",
      "exit",
      "leave",
      "what if someone wants out",
      "buyout",
      "selling share",
    ],
    available: false,
  },
  {
    id: "guide-choosing-cobuyers",
    name: "Choosing the Right Co-Buyers",
    description: "Tips for finding and vetting potential co-owners",
    url: "/guides/choosing-cobuyers",
    category: "guide",
    triggers: [
      "find co-buyers",
      "who should I buy with",
      "choosing partners",
      "vetting",
      "finding co-owners",
    ],
    available: false,
  },

  // === BOOKING ===
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
export function formatResourcesForPrompt(): string {
  const available = getAvailableResources();
  const comingSoon = TOMI_RESOURCES.filter((r) => !r.available);

  let prompt = `## Available Tools & Resources
When relevant, link users to these resources using markdown format: [Link Text](url)

`;

  // Group available resources by category
  const byCategory = available.reduce(
    (acc, r) => {
      if (!acc[r.category]) acc[r.category] = [];
      acc[r.category].push(r);
      return acc;
    },
    {} as Record<string, Resource[]>
  );

  for (const [category, resources] of Object.entries(byCategory)) {
    prompt += `### ${category.charAt(0).toUpperCase() + category.slice(1)}s\n`;
    for (const r of resources) {
      prompt += `- **${r.name}** (${r.url}): ${r.description}\n`;
      prompt += `  Suggest when: ${r.triggers.slice(0, 3).join(", ")}\n`;
    }
    prompt += "\n";
  }

  if (comingSoon.length > 0) {
    prompt += `### Coming Soon (mention but don't link)\n`;
    for (const r of comingSoon) {
      prompt += `- ${r.name}: ${r.description}\n`;
    }
  }

  prompt += `
## Linking Guidelines
- Link naturally within your response, don't just dump links
- Only suggest ONE primary action per response
- For "coming soon" resources, acknowledge interest but don't link
- Example: "That's a great question! Our [Co-Buying Calculator](/calculator) can help you see exactly how much more you could afford."
`;

  return prompt;
}
