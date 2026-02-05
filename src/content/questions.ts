export const heroQuestions = [
  // Core co-ownership questions first
  "Can I buy a home with a friend?",
  "How does co-buying work?",
  "How common is co-ownership?",
  "How much more home could I afford?",
  // Risk/fear questions
  "What if someone wants to sell?",
  "What if someone stops paying?",
  "How do we handle disagreements?",
  "Will this ruin my friendship?",
  "How do I protect myself legally?",
  // Tomi/AI value prop
  "How does AI make co-buying easier?",
  "How does Tomi help?",
];

export const objectionCards = [
  {
    question: "What if we disagree?",
    answer:
      "Your TIC agreement includes a clear decision-making framework before you buy. Major decisions require consensus; day-to-day choices follow rules you set together. Tomi helps you have these conversations early—when they're hypothetical, not heated.",
  },
  {
    question: "What if someone can't pay?",
    answer:
      "Your agreement defines grace periods, remedies, and buyout terms upfront. We help you plan for life's curveballs—job loss, medical issues, or just changing priorities—so everyone knows what to expect.",
  },
  {
    question: "How do we split things fairly?",
    answer:
      "Equity splits can reflect different down payments, ongoing contributions, or sweat equity. Your agreement captures what \"fair\" means to your group specifically—not a one-size-fits-all formula.",
  },
  {
    question: "What if one of us wants to sell?",
    answer:
      "Your agreement includes exit procedures: rights of first refusal for other owners, required notice periods, valuation methods, and buyout terms. No surprises.",
  },
  {
    question: "Is this even legal?",
    answer:
      "Absolutely. Tenancy-in-common has been a recognized ownership structure for centuries. We help you create a legally sound agreement reviewed by attorneys who specialize in co-ownership.",
  },
  {
    question: "What about my credit?",
    answer:
      "Co-buyers typically apply for a mortgage together, so everyone's credit matters. We help you understand requirements early and can connect you with lenders experienced in co-buyer transactions.",
  },
];

export const howItWorksSteps = [
  {
    number: "01",
    title: "Design",
    description:
      "Define your vision for co-ownership. Clarify your goals, timeline, and what you want out of sharing a home.",
    icon: "Compass",
    cta: { text: "Take the Assessment", href: "/assessment" },
    imageDirection: "left" as const,
    image: "/eating outside 3.webp",
  },
  {
    number: "02",
    title: "Align",
    description:
      "Get your group on the same page. Share your vision, understand theirs, and find common ground on what matters.",
    icon: "Users",
    cta: { text: "Start a Group", href: "/vision-plan" },
    imageDirection: "right" as const,
    image: "/camping 3.webp",
  },
  {
    number: "03",
    title: "Formalize",
    description:
      "Build your legal agreement and get financially qualified. Every hard question answered before you buy.",
    icon: "FileCheck",
    cta: { text: "Build Your Agreement", href: "/tic-builder" },
    imageDirection: "top" as const,
    image: "/kitchen planning 3.webp",
  },
  {
    number: "04",
    title: "Close",
    description:
      "Buy your home with confidence. We coordinate with lenders, agents, and attorneys to get you to the finish line.",
    icon: "Key",
    cta: { text: "Run the Numbers", href: "/calc" },
    imageDirection: "bottom" as const,
    image: "/living-room-lake-view.webp",
  },
  {
    number: "05",
    title: "Create",
    description:
      "Live, manage, and grow together. Track expenses, make decisions, and plan for the future—including eventual transitions.",
    icon: "Home",
    cta: { text: "See How It Works", href: "/demo" },
    imageDirection: "left" as const,
    image: "/movie-night-backyard.webp",
  },
];

export const tomiDifferenceFeatures = [
  {
    title: "AI that handles the hard parts",
    description:
      "Co-ownership used to mean expensive lawyers and months of back-and-forth. Now, Homi drafts your legal agreements, answers complex questions instantly, and guides every decision—from \"who pays for repairs?\" to \"what if someone wants out?\" This is why co-ownership finally works.",
    icon: "Sparkles",
  },
  {
    title: "We're your partner, not your vendor",
    description:
      "We charge $0 upfront. Instead, we take a 1% stake in your home—realized only when you sell. That means our incentives are perfectly aligned: we make money when your home grows in value. We're not here for a quick transaction. We're here for your entire journey.",
    icon: "Handshake",
  },
];
