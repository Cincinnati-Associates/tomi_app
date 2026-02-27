/**
 * Assessment Types & Constants (shared between client and server)
 *
 * This file contains types, constants, and pure functions used by both
 * the client-side assessment UI (useAssessment hook) and server-side
 * knowledge assemblers. It must NOT import any client-only packages
 * (React, posthog, etc.) to avoid Next.js RSC boundary violations.
 */

// ── Profile Dimensions ──

export type ProfileDimension =
  | "financial"
  | "emotional"
  | "legal"
  | "knowledge"
  | "relational";

export const DIMENSION_LABELS: Record<ProfileDimension, string> = {
  financial: "Financial Readiness",
  emotional: "Emotional Readiness",
  legal: "Legal & Structural Knowledge",
  knowledge: "Co-Ownership Education",
  relational: "Co-Buyer Dynamics",
};

export const DIMENSION_DESCRIPTIONS: Record<ProfileDimension, { strong: string; weak: string }> = {
  financial: {
    strong: "Financially prepared with savings and credit in good shape",
    weak: "May need help with financial planning, savings strategy, or credit improvement",
  },
  emotional: {
    strong: "Emotionally ready and confident about shared homeownership",
    weak: "Has fears or uncertainties about the emotional aspects of co-owning",
  },
  legal: {
    strong: "Good understanding of legal structures and co-ownership agreements",
    weak: "Limited knowledge of TIC structures, agreements, and legal protections",
  },
  knowledge: {
    strong: "Well-educated about the co-buying process and market",
    weak: "Needs more education about co-ownership fundamentals",
  },
  relational: {
    strong: "Has strong co-buyer relationships with open communication",
    weak: "Needs help finding co-buyers or building communication comfort",
  },
};

// ── Question Categories ──

export type QuestionCategory = "motivation" | "people" | "finances" | "readiness";

export interface CategoryInfo {
  id: QuestionCategory;
  label: string;
  questionCount: number;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "motivation", label: "Motivation", questionCount: 3 },
  { id: "people", label: "People", questionCount: 3 },
  { id: "finances", label: "Finances", questionCount: 3 },
  { id: "readiness", label: "Readiness", questionCount: 3 },
];

// ── Types ──

export interface AnswerOption {
  text: string;
  score: number;
  dimensions: ProfileDimension[];
}

export interface AssessmentQuestion {
  id: number;
  category: QuestionCategory;
  question: string;
  subtext?: string;
  options: AnswerOption[]; // always exactly 4
  customInputPlaceholder: string;
}

export type Grade = "A" | "B" | "C" | "D";

export interface DimensionProfile {
  tallies: Record<ProfileDimension, number>;
  primaryConcerns: ProfileDimension[];
  growthAreas: ProfileDimension[];
  summary: string;
}

export interface CustomAnswer {
  questionId: number;
  text: string;
}

export interface AnswerData {
  score: number;
  optionIndex: number; // 0-3 for fixed options, 4 for custom
  isCustom?: boolean;
  customText?: string;
  dimensions: ProfileDimension[];
}

// ── Scoring Constants ──

export const MAX_SCORE = 36; // 12 questions × 3 max

// ── Pure Functions ──

export function computeDimensionProfile(answers: (AnswerData | null)[]): DimensionProfile {
  const tallies: Record<ProfileDimension, number> = {
    financial: 0,
    emotional: 0,
    legal: 0,
    knowledge: 0,
    relational: 0,
  };

  for (const answer of answers) {
    if (!answer) continue;
    if (Array.isArray(answer.dimensions)) {
      for (const dim of answer.dimensions) {
        tallies[dim]++;
      }
    }
  }

  // Sort dimensions by tally (descending)
  const sorted = (Object.entries(tallies) as [ProfileDimension, number][])
    .sort((a, b) => b[1] - a[1]);

  const primaryConcerns = sorted.slice(0, 2).map(([dim]) => dim);
  const growthAreas = sorted.slice(-2).map(([dim]) => dim);

  // Build summary
  const primaryLabels = primaryConcerns.map((d) => DIMENSION_LABELS[d]).join(" and ");
  const growthLabels = growthAreas.map((d) => DIMENSION_LABELS[d]).join(" and ");
  const summary = `Primarily focused on ${primaryLabels}. Growth areas: ${growthLabels}.`;

  return { tallies, primaryConcerns, growthAreas, summary };
}
