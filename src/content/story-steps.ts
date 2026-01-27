// Story steps for the interactive "How It Works" experience

export type VisualType =
  | "animated-stat"
  | "comparison-bars"
  | "barrier-icons"
  | "world-map"
  | "culture-carousel"
  | "timeline"
  | "calligraphy"
  | "then-vs-now"
  | "pillar-cards"
  | "buying-power-preview"
  | "glowing-cta";

export type InteractionType = "continue" | "multiple-choice" | "text-input" | "cta";

export interface StoryStep {
  id: string;
  chapter: 1 | 2 | 3;
  chapterTitle: string;
  visual: {
    type: VisualType;
    props: Record<string, unknown>;
  };
  message: string;
  interaction: {
    type: InteractionType;
    buttonText?: string;
    options?: { label: string; value: string }[];
    placeholder?: string;
    ctaButtons?: { label: string; href?: string; action?: "restart" | "chat"; primary?: boolean }[];
  };
  nextStep: string | null; // null = end, or step ID
  getNextStep?: (response: string) => string; // Dynamic routing based on response
}

export const STORY_STEPS: StoryStep[] = [
  // ============================================
  // CHAPTER 1: THE PROBLEM
  // ============================================
  {
    id: "1.1-opening",
    chapter: 1,
    chapterTitle: "The Problem",
    visual: {
      type: "animated-stat",
      props: {
        value: 340000,
        prefix: "$",
        label: "Median US Home Price",
        subLabel: "2024",
      },
    },
    message: "Did you know the median US home price has increased 47% in just 5 years?",
    interaction: {
      type: "continue",
      buttonText: "Continue",
    },
    nextStep: "1.2-the-gap",
  },
  {
    id: "1.2-the-gap",
    chapter: 1,
    chapterTitle: "The Problem",
    visual: {
      type: "comparison-bars",
      props: {
        bars: [
          { label: "Wage Growth", value: 12, color: "muted" },
          { label: "Home Price Growth", value: 47, color: "destructive" },
        ],
        timeframe: "2019-2024",
      },
    },
    message: "Meanwhile, wages have only grown 12%. That's a 35% gap. No wonder it feels impossible.",
    interaction: {
      type: "continue",
      buttonText: "Continue",
    },
    nextStep: "1.3-barrier",
  },
  {
    id: "1.3-barrier",
    chapter: 1,
    chapterTitle: "The Problem",
    visual: {
      type: "barrier-icons",
      props: {
        barriers: [
          { id: "down-payment", icon: "down-payment", label: "Down payment" },
          { id: "monthly", icon: "monthly", label: "Monthly payments" },
          { id: "location", icon: "location", label: "Location/home type" },
          { id: "all", icon: "all", label: "All of the above" },
        ],
      },
    },
    message: "What's been your biggest barrier to homeownership?",
    interaction: {
      type: "multiple-choice",
      options: [
        { label: "Down payment is too high", value: "down-payment" },
        { label: "Monthly payments would stretch me thin", value: "monthly" },
        { label: "Can't find a home I want in my budget", value: "location" },
        { label: "All of the above", value: "all" },
      ],
    },
    nextStep: "2.1-not-new",
    getNextStep: () => "2.1-not-new", // All paths lead to chapter 2
  },

  // ============================================
  // CHAPTER 2: THE HISTORY
  // ============================================
  {
    id: "2.1-not-new",
    chapter: 2,
    chapterTitle: "The History",
    visual: {
      type: "world-map",
      props: {
        markers: [
          { id: "japan", country: "Japan", label: "Ie (家)", x: 85, y: 35 },
          { id: "africa", country: "Kenya", label: "Stokvels", x: 55, y: 55 },
          { id: "latam", country: "Mexico", label: "Tandas", x: 18, y: 42 },
          { id: "israel", country: "Israel", label: "Kibbutzim", x: 56, y: 38 },
          { id: "denmark", country: "Denmark", label: "Bofællesskab", x: 50, y: 25 },
        ],
        animateSequence: true,
      },
    },
    message: "Here's the thing — buying homes together isn't new. Cultures around the world have been doing it for centuries.",
    interaction: {
      type: "continue",
      buttonText: "Tell me more",
    },
    nextStep: "2.2-cultures",
  },
  {
    id: "2.2-cultures",
    chapter: 2,
    chapterTitle: "The History",
    visual: {
      type: "culture-carousel",
      props: {
        cultures: [
          {
            id: "japan",
            flag: "🇯🇵",
            country: "Japan",
            name: "Ie (家)",
            description: "Multi-generational family estates where wealth passes through shared property",
          },
          {
            id: "africa",
            flag: "🇰🇪",
            country: "Africa",
            name: "Stokvels & Chamas",
            description: "Community savings groups that pool resources to buy property together",
          },
          {
            id: "latam",
            flag: "🇲🇽",
            country: "Latin America",
            name: "Tandas",
            description: "Rotating savings circles where members take turns receiving lump sums for down payments",
          },
          {
            id: "israel",
            flag: "🇮🇱",
            country: "Israel",
            name: "Kibbutzim",
            description: "Collective communities with shared ownership of land and homes",
          },
          {
            id: "denmark",
            flag: "🇩🇰",
            country: "Denmark",
            name: "Bofællesskab",
            description: "Modern co-housing cooperatives designed for intentional community living",
          },
        ],
      },
    },
    message: "Swipe through to explore how different cultures have built wealth together.",
    interaction: {
      type: "continue",
      buttonText: "Continue",
    },
    nextStep: "2.3-personalize",
  },
  {
    id: "2.3-personalize",
    chapter: 2,
    chapterTitle: "The History",
    visual: {
      type: "barrier-icons",
      props: {
        barriers: [
          { id: "family", icon: "down-payment", label: "Family" },
          { id: "friends", icon: "monthly", label: "Friends" },
          { id: "community", icon: "location", label: "Community" },
          { id: "exploring", icon: "all", label: "Exploring" },
        ],
      },
    },
    message: "Which of these resonates most with what you're imagining?",
    interaction: {
      type: "multiple-choice",
      options: [
        { label: "Buying with family across generations", value: "family" },
        { label: "Pooling resources with close friends", value: "friends" },
        { label: "Building community with like-minded people", value: "community" },
        { label: "I'm not sure yet — just exploring", value: "exploring" },
      ],
    },
    nextStep: "2.4-bridge",
  },
  {
    id: "2.4-bridge",
    chapter: 2,
    chapterTitle: "The History",
    visual: {
      type: "timeline",
      props: {
        points: [
          { era: "Ancient", label: "Trust & handshakes", icon: "🤝" },
          { era: "1900s", label: "Legal agreements", icon: "📜" },
          { era: "Today", label: "AI-powered simplicity", icon: "🤖" },
        ],
      },
    },
    message: "These traditions worked because of trust and shared goals. Today, we have something they didn't: technology to make it simpler, safer, and more transparent.",
    interaction: {
      type: "continue",
      buttonText: "Show me how",
    },
    nextStep: "3.1-name",
  },

  // ============================================
  // CHAPTER 3: THE TOMI WAY
  // ============================================
  {
    id: "3.1-name",
    chapter: 3,
    chapterTitle: "The Tomi Way",
    visual: {
      type: "calligraphy",
      props: {
        character: "富",
        meaning: "",
        pronunciation: "tomi",
        showMeaning: false,
      },
    },
    message: "That's where Tomi comes in.",
    interaction: {
      type: "continue",
      buttonText: "What does Tomi mean?",
    },
    nextStep: "3.2-meaning",
  },
  {
    id: "3.2-meaning",
    chapter: 3,
    chapterTitle: "The Tomi Way",
    visual: {
      type: "calligraphy",
      props: {
        character: "富",
        meaning: "wealth, abundance, prosperity",
        pronunciation: "tomi",
        showMeaning: true,
      },
    },
    message: "'Tomi' (富) is Japanese for wealth. But in Japan, wealth isn't just money — it's security, legacy, and building something that lasts. That's what we help you create.",
    interaction: {
      type: "continue",
      buttonText: "How does it work?",
    },
    nextStep: "3.3-ai",
  },
  {
    id: "3.3-ai",
    chapter: 3,
    chapterTitle: "The Tomi Way",
    visual: {
      type: "then-vs-now",
      props: {
        thenItems: [
          { icon: "paperwork", text: "Mountains of paperwork" },
          { icon: "lawyers", text: "Expensive lawyers" },
          { icon: "time", text: "Weeks of back-and-forth" },
        ],
        nowItems: [
          { icon: "ai", text: "Smart AI guidance" },
          { icon: "protection", text: "Clear agreements" },
          { icon: "insights", text: "Real-time tracking" },
        ],
      },
    },
    message: "Co-ownership used to mean mountains of paperwork, expensive lawyers, and hoping everyone stayed on the same page. AI changes everything.",
    interaction: {
      type: "continue",
      buttonText: "What can AI do?",
    },
    nextStep: "3.4-pillars",
  },
  {
    id: "3.4-pillars",
    chapter: 3,
    chapterTitle: "The Tomi Way",
    visual: {
      type: "pillar-cards",
      props: {
        pillars: [
          {
            id: "guidance",
            icon: "ai",
            title: "Smart Guidance",
            description: "Get personalized answers instantly, not in 3-5 business days",
          },
          {
            id: "agreements",
            icon: "agreements",
            title: "Clear Agreements",
            description: "AI helps draft TIC agreements that protect everyone fairly",
          },
          {
            id: "insights",
            icon: "insights",
            title: "Live Insights",
            description: "Track equity, payments, and ownership in real-time",
          },
        ],
      },
    },
    message: "Tomi uses AI to handle the hard parts:",
    interaction: {
      type: "continue",
      buttonText: "Show me the numbers",
    },
    nextStep: "3.5-preview",
  },
  {
    id: "3.5-preview",
    chapter: 3,
    chapterTitle: "The Tomi Way",
    visual: {
      type: "buying-power-preview",
      props: {
        baseAmount: 340,
        multipliers: [
          { buyers: 2, amount: 680 },
          { buyers: 3, amount: 1020 },
        ],
        animationDelay: 2500,
      },
    },
    message: "Let's make it real. Say you can afford $340K alone... With co-buyers, you're not just doubling your budget — you're unlocking entirely different neighborhoods and home types.",
    interaction: {
      type: "continue",
      buttonText: "See my real numbers",
    },
    nextStep: "3.6-cta",
  },
  {
    id: "3.6-cta",
    chapter: 3,
    chapterTitle: "The Tomi Way",
    visual: {
      type: "glowing-cta",
      props: {
        title: "Calculate Your Buying Power",
        subtitle: "See what you could afford with co-buyers",
      },
    },
    message: "Ready to see what you could actually afford — together?",
    interaction: {
      type: "cta",
      ctaButtons: [
        { label: "Calculate My Buying Power", href: "/calculator", primary: true },
        { label: "I have questions first", action: "chat" },
        { label: "Start over", action: "restart" },
      ],
    },
    nextStep: null,
  },
];

// Helper to get step by ID
export function getStepById(id: string): StoryStep | undefined {
  return STORY_STEPS.find((step) => step.id === id);
}

// Helper to get first step
export function getFirstStep(): StoryStep {
  return STORY_STEPS[0];
}

// Helper to get total chapters
export const TOTAL_CHAPTERS = 3;

// Chapter titles
export const CHAPTER_TITLES: Record<number, string> = {
  1: "The Problem",
  2: "The History",
  3: "The Tomi Way",
};
