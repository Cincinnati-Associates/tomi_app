export const heroQuestions = [
  "What is Tomi?",
  "What if my co-buyer wants to sell early?",
  "How do we split equity fairly?",
  "Can I co-own with a friend?",
  "What happens if someone can't pay?",
  "How do I know if tenants in common is right for me?",
  "How do we handle disagreements?",
  "What is a Tenants in Common Agreement?",
  "How do we find the right co-buyer?",
  "How do I sell my share of a home?",
  "What are the tax considerations of joint homeownership?",
  "How does Tomi make money?",
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
    title: "Explore",
    description:
      "Discover if co-ownership fits your life through guided exercises and AI-powered conversations.",
    icon: "Compass",
    cta: { text: "Take the Readiness Assessment", href: "/assessment" },
    imageDirection: "left" as const,
    image: "/eating outside 3.webp",
  },
  {
    number: "02",
    title: "Form Your Group",
    description:
      "Find compatible co-buyers or bring people you already know. We help you align on what matters.",
    icon: "Users",
    cta: { text: "Define Your Vision", href: "/vision-plan" },
    imageDirection: "right" as const,
    image: "/camping 3.webp",
  },
  {
    number: "03",
    title: "Build Your Agreement",
    description:
      "Create your legal framework together with our TIC Agreement Builder. Every hard question, answered.",
    icon: "FileCheck",
    cta: { text: "Try the TIC Builder", href: "/tic-builder" },
    imageDirection: "top" as const,
    image: "/kitchen planning 3.webp",
  },
  {
    number: "04",
    title: "Buy & Manage",
    description:
      "Close with confidence and manage your shared home with tools built for co-owners.",
    icon: "Home",
    cta: { text: "Calculate Your Numbers", href: "/calculator" },
    imageDirection: "bottom" as const,
    image: "/hang out living room.webp",
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
