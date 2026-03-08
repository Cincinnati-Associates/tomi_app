export type FaqCategory = "legal" | "financial" | "living" | "tomi";

export interface FaqItem {
  question: string;
  answer: string;
  category: FaqCategory;
}

export const faqCategoryLabels: Record<FaqCategory, string> = {
  legal: "Legal",
  financial: "Financial",
  living: "Living Together",
  tomi: "How Tomi Works",
};

export const faqItems: FaqItem[] = [
  {
    question: "What is a Tenancy in Common (TIC) agreement?",
    answer:
      "A Tenancy in Common (TIC) is the legal structure that lets two or more people own individual percentages of a single property. Unlike joint tenancy (typically used by married couples), a TIC lets each owner hold a distinct share they can sell, refinance, or pass to heirs independently. Your TIC agreement defines ownership splits, financial responsibilities, decision-making rules, and exit procedures before you buy.",
    category: "legal",
  },
  {
    question: "Can I get a mortgage with a friend or family member?",
    answer:
      "Yes. Lenders evaluate your combined debt-to-income ratio and credit scores\u2014they don\u2019t require a marriage certificate. Co-buying with a partner often increases your purchasing power by 2\u20134x. The process is similar to any joint mortgage application; you just need a co-ownership agreement that defines what happens if one person wants out.",
    category: "financial",
  },
  {
    question: "How much does co-buying a home actually cost?",
    answer:
      "The home purchase costs are the same as buying solo\u2014closing costs, inspections, and the down payment split between co-buyers. The difference is the TIC agreement: a real estate attorney typically charges $4,000\u2013$8,000 to draft one. Tomi provides the legal framework and AI-guided agreement drafting at no upfront cost.",
    category: "financial",
  },
  {
    question: "What happens if one co-owner wants to sell or move out?",
    answer:
      "Your co-ownership agreement includes a built-in exit strategy. Typically this means a Right of First Refusal\u2014remaining owners get the first opportunity to buy the departing owner\u2019s share at fair market value. The agreement also defines notice periods, valuation methods, and buyout timelines so the transition is orderly, not adversarial.",
    category: "legal",
  },
  {
    question: "What if someone stops paying their share of the mortgage?",
    answer:
      "Your TIC agreement defines grace periods, remedies, and consequences before you ever close. This usually includes a cure period (30\u201390 days), mediation steps, and ultimately a forced buyout provision. Planning for this scenario upfront is exactly why co-ownership agreements exist\u2014it protects everyone.",
    category: "legal",
  },
  {
    question: "How do co-owners split equity if they contributed different amounts?",
    answer:
      "Equity splits can reflect different down payments, monthly contributions, renovation investments, or sweat equity. Your TIC agreement captures the exact formula your group agrees on\u2014percentage-based, contribution-based, or a hybrid. Tomi helps you model different scenarios so the split feels fair to everyone before you commit.",
    category: "financial",
  },
  {
    question: "How do co-owners make decisions about the property?",
    answer:
      "Your agreement defines a decision-making framework: day-to-day decisions (repairs under a certain dollar amount) can be made individually, while major decisions (renovations, refinancing, selling) require consensus or a majority vote. You set these thresholds together during the agreement process.",
    category: "living",
  },
  {
    question: "Can I co-buy a home with someone who has bad credit?",
    answer:
      "It depends on how the mortgage is structured. All co-borrowers on a joint mortgage are evaluated together, so one person\u2019s low score can affect the rate or approval. Some groups work around this by having only the higher-credit members on the mortgage while the other co-owner contributes to the down payment and is on the title via the TIC agreement.",
    category: "financial",
  },
  {
    question: "Is co-ownership legally recognized? Is it safe?",
    answer:
      "Tenancy in common has been a recognized property ownership structure for centuries in every U.S. state. It\u2019s the same legal framework used in commercial real estate, investment properties, and inherited homes. A well-drafted TIC agreement\u2014reviewed by an attorney\u2014gives you the same legal protections as any other property contract.",
    category: "legal",
  },
  {
    question: "How is Tomi different from just hiring a real estate lawyer?",
    answer:
      "A lawyer drafts your agreement after a few hours of consultation. Tomi guides you through the entire co-buying journey\u2014from aligning with your co-buyers on hundreds of decisions, to generating your agreement, to ongoing support after you close. We charge $0 upfront and take a 1% stake realized only when you sell, so our incentives stay aligned with yours for the life of the home.",
    category: "tomi",
  },
];
