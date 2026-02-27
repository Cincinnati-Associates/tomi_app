"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import posthog from "posthog-js";

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

export interface AssessmentResult {
  totalScore: number;
  maxScore: number;
  grade: Grade;
  title: string;
  message: string;
  dimensionProfile: DimensionProfile;
  customAnswers: CustomAnswer[];
  primaryCta: {
    text: string;
    href: string;
    type: "invite_coowner" | "talk_to_homi" | "learn_more";
  };
  secondaryCta: {
    text: string;
    href?: string;
    type: "invite_coowner" | "talk_to_homi" | "learn_more";
    action?: "open_chat";
  };
}

// ── Questions (12 questions, 4 categories, 4 options each) ──

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // ── Category 1: MOTIVATION (3 questions) ──
  {
    id: 1,
    category: "motivation",
    question: "What's pulling you toward co-ownership?",
    customInputPlaceholder: "I have a different reason...",
    options: [
      { text: "I've done the math — it's the fastest path to building equity", score: 3, dimensions: ["financial", "knowledge"] },
      { text: "I want to stop paying someone else's mortgage", score: 2, dimensions: ["financial", "emotional"] },
      { text: "I like the idea of sharing the responsibility", score: 1, dimensions: ["emotional", "relational"] },
      { text: "I'm not sure yet — just exploring", score: 0, dimensions: ["knowledge"] },
    ],
  },
  {
    id: 2,
    category: "motivation",
    question: "What do you envision your shared home looking like?",
    customInputPlaceholder: "I have something else in mind...",
    options: [
      { text: "An investment property — I'm thinking about returns", score: 3, dimensions: ["financial", "knowledge"] },
      { text: "A vacation home — shared getaway spot", score: 2, dimensions: ["emotional", "financial"] },
      { text: "A primary residence — where I'd actually live", score: 1, dimensions: ["emotional"] },
      { text: "I don't know yet — I just know I want in", score: 0, dimensions: ["knowledge"] },
    ],
  },
  {
    id: 3,
    category: "motivation",
    question: "Have you looked into co-ownership before?",
    customInputPlaceholder: "It's complicated...",
    options: [
      { text: "I'm already doing it or have done it", score: 3, dimensions: ["knowledge", "legal"] },
      { text: "Yes, I've researched it seriously", score: 2, dimensions: ["knowledge", "legal"] },
      { text: "I've seen it mentioned but haven't dug in", score: 1, dimensions: ["knowledge"] },
      { text: "This is completely new to me", score: 0, dimensions: ["knowledge"] },
    ],
  },

  // ── Category 2: PEOPLE (3 questions) ──
  {
    id: 4,
    category: "people",
    question: "Do you have someone in mind you'd want to co-own with?",
    customInputPlaceholder: "It's a different situation...",
    options: [
      { text: "Yes — my spouse or partner", score: 3, dimensions: ["relational", "emotional"] },
      { text: "Yes — a family member", score: 2, dimensions: ["relational", "emotional"] },
      { text: "Yes — a close friend or someone I trust", score: 1, dimensions: ["relational"] },
      { text: "Not yet — I'd need to find the right person", score: 0, dimensions: ["relational", "knowledge"] },
    ],
  },
  {
    id: 5,
    category: "people",
    question: "Of the people you'd consider co-buying with, would you feel comfortable talking openly about money?",
    customInputPlaceholder: "It depends on...",
    options: [
      { text: "Absolutely — we're already open books", score: 3, dimensions: ["relational", "financial"] },
      { text: "I'd share what's necessary for the deal", score: 2, dimensions: ["relational", "financial"] },
      { text: "Maybe, with the right structure and guidance", score: 1, dimensions: ["relational", "emotional"] },
      { text: "That would be really uncomfortable", score: 0, dimensions: ["emotional", "relational"] },
    ],
  },
  {
    id: 6,
    category: "people",
    question: "What's your biggest concern about sharing a home with someone?",
    customInputPlaceholder: "I have other concerns...",
    options: [
      { text: "How we'd handle disagreements on big decisions", score: 3, dimensions: ["relational", "legal"] },
      { text: "What happens if someone can't pay their share", score: 2, dimensions: ["financial", "relational"] },
      { text: "What happens if one of us wants out", score: 1, dimensions: ["legal", "emotional"] },
      { text: "How does the financing work?", score: 0, dimensions: ["knowledge", "financial"] },
    ],
  },

  // ── Category 3: FINANCES (3 questions) ──
  {
    id: 7,
    category: "finances",
    question: "How much would you be willing to put down for the right shared home?",
    customInputPlaceholder: "My situation is different...",
    options: [
      { text: "$50,000 or more", score: 3, dimensions: ["financial"] },
      { text: "$25,000 – $49,999", score: 2, dimensions: ["financial"] },
      { text: "$10,000 – $24,999", score: 1, dimensions: ["financial"] },
      { text: "Less than $10,000", score: 0, dimensions: ["financial"] },
    ],
  },
  {
    id: 8,
    category: "finances",
    question: "What's your monthly housing budget?",
    subtext: "Include rent or mortgage, electric, gas, water, and internet",
    customInputPlaceholder: "It's hard to say...",
    options: [
      { text: "$3,000+ per month", score: 3, dimensions: ["financial"] },
      { text: "$2,000 – $2,999 per month", score: 2, dimensions: ["financial"] },
      { text: "$1,000 – $1,999 per month", score: 1, dimensions: ["financial"] },
      { text: "Less than $1,000 per month", score: 0, dimensions: ["financial"] },
    ],
  },
  {
    id: 9,
    category: "finances",
    question: "How's your credit looking these days?",
    customInputPlaceholder: "It's complicated...",
    options: [
      { text: "Strong — minimal debt, 750+ score", score: 3, dimensions: ["financial"] },
      { text: "Solid — manageable debt, 680–750", score: 2, dimensions: ["financial"] },
      { text: "Working on it — some challenges", score: 1, dimensions: ["financial", "emotional"] },
      { text: "Honestly, I'd need to check", score: 0, dimensions: ["financial", "knowledge"] },
    ],
  },

  // ── Category 4: READINESS (3 questions) ──
  {
    id: 10,
    category: "readiness",
    question: "What type of co-ownership sounds most like you?",
    customInputPlaceholder: "I have a different situation...",
    options: [
      { text: "Living together full- or part-time", score: 3, dimensions: ["relational", "emotional"] },
      { text: "Splitting a vacation home I couldn't afford alone", score: 2, dimensions: ["financial", "emotional"] },
      { text: "A timeshare-style arrangement with scheduled access", score: 1, dimensions: ["legal", "knowledge"] },
      { text: "Helping someone I care about get a leg up", score: 0, dimensions: ["relational", "financial"] },
    ],
  },
  {
    id: 11,
    category: "readiness",
    question: "Have you ever bought a home before?",
    customInputPlaceholder: "My relationship with homeownership is unique...",
    options: [
      { text: "Yes — within the last few years", score: 3, dimensions: ["knowledge", "financial"] },
      { text: "Yes — but it's been a while", score: 2, dimensions: ["knowledge"] },
      { text: "No — but I've been seriously looking into it", score: 1, dimensions: ["knowledge", "emotional"] },
      { text: "No — I'm just starting to explore the idea", score: 0, dimensions: ["knowledge"] },
    ],
  },
  {
    id: 12,
    category: "readiness",
    question: "How soon do you want to make this happen?",
    customInputPlaceholder: "My timeline is unique...",
    options: [
      { text: "Within the next 6 months", score: 3, dimensions: ["financial", "emotional"] },
      { text: "6–12 months from now", score: 2, dimensions: ["knowledge"] },
      { text: "1–2 years — building toward it", score: 1, dimensions: ["financial"] },
      { text: "Just exploring — no timeline", score: 0, dimensions: ["emotional"] },
    ],
  },
];

// ── Scoring ──

export const MAX_SCORE = 36; // 12 questions × 3 max

const CUSTOM_INPUT_SCORE = 1; // Neutral score for custom text answers

// Compute dimension profile from answers
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

// Collect custom answers
function collectCustomAnswers(answers: (AnswerData | null)[]): CustomAnswer[] {
  const customs: CustomAnswer[] = [];
  answers.forEach((answer, idx) => {
    if (answer?.isCustom && answer.customText) {
      customs.push({
        questionId: ASSESSMENT_QUESTIONS[idx]?.id ?? idx + 1,
        text: answer.customText,
      });
    }
  });
  return customs;
}

// Calculate result based on score
function calculateResult(totalScore: number, answers: (AnswerData | null)[]): AssessmentResult {
  const dimensionProfile = computeDimensionProfile(answers);
  const customAnswers = collectCustomAnswers(answers);

  const base = {
    totalScore,
    maxScore: MAX_SCORE,
    dimensionProfile,
    customAnswers,
  };

  if (totalScore >= 29) {
    return {
      ...base,
      grade: "A",
      title: "Ready to Go!",
      message:
        "You're in great shape for co-ownership! You have clarity on the key decisions. Let's get you started with a free TIC agreement—just invite your potential co-owner to join.",
      primaryCta: {
        text: "Invite Your Co-Owner",
        href: "/calc",
        type: "invite_coowner",
      },
      secondaryCta: {
        text: "Talk to Homi",
        type: "talk_to_homi",
        action: "open_chat",
      },
    };
  } else if (totalScore >= 22) {
    return {
      ...base,
      grade: "B",
      title: "Almost There",
      message:
        "You're on the right track! A few more conversations and decisions will get you ready. Homi can help you think through the details.",
      primaryCta: {
        text: "Talk to Homi",
        href: "#",
        type: "talk_to_homi",
      },
      secondaryCta: {
        text: "Explore How It Works",
        href: "/co-ownership-history",
        type: "learn_more",
      },
    };
  } else if (totalScore >= 13) {
    return {
      ...base,
      grade: "C",
      title: "Getting Started",
      message:
        "Co-ownership could be a great fit for you with some preparation. Learn more about how it works and what to consider.",
      primaryCta: {
        text: "Learn How Co-Ownership Works",
        href: "/co-ownership-history",
        type: "learn_more",
      },
      secondaryCta: {
        text: "Talk to Homi",
        type: "talk_to_homi",
        action: "open_chat",
      },
    };
  } else {
    return {
      ...base,
      grade: "D",
      title: "Just Exploring",
      message:
        "Looks like you're early in your journey—that's totally fine! Let us show you what co-ownership is all about.",
      primaryCta: {
        text: "Discover Co-Ownership",
        href: "/co-ownership-history",
        type: "learn_more",
      },
      secondaryCta: {
        text: "Talk to Homi",
        type: "talk_to_homi",
        action: "open_chat",
      },
    };
  }
}

// Get projected grade based on current score
function getProjectedGrade(currentScore: number, answeredCount: number): Grade {
  if (answeredCount === 0) return "D";

  const avgScore = currentScore / answeredCount;
  const projectedTotal = avgScore * ASSESSMENT_QUESTIONS.length;

  if (projectedTotal >= 29) return "A";
  if (projectedTotal >= 22) return "B";
  if (projectedTotal >= 13) return "C";
  return "D";
}

// ── Context for Homi ──

export interface AssessmentContext {
  currentQuestion: number;
  totalQuestions: number;
  currentCategory: string;
  answeredQuestions: {
    question: string;
    answer: string;
    score: number;
    category: string;
    dimensions: ProfileDimension[];
  }[];
  currentScore: number;
  maxPossibleScore: number;
  projectedGrade: Grade;
  isComplete: boolean;
  result?: AssessmentResult;
  dimensionProfile?: DimensionProfile;
}

// ── Helper Functions ──

function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined" && posthog) {
    posthog.capture(eventName, properties);
  }
}

export function getCategoryForQuestion(questionIndex: number): QuestionCategory {
  return ASSESSMENT_QUESTIONS[questionIndex]?.category || "motivation";
}

export function getSectionProgress(answers: (AnswerData | null)[]): Record<QuestionCategory, { completed: number; total: number }> {
  const progress: Record<QuestionCategory, { completed: number; total: number }> = {
    motivation: { completed: 0, total: 0 },
    people: { completed: 0, total: 0 },
    finances: { completed: 0, total: 0 },
    readiness: { completed: 0, total: 0 },
  };

  ASSESSMENT_QUESTIONS.forEach((q, idx) => {
    progress[q.category].total++;
    if (answers[idx] !== null) {
      progress[q.category].completed++;
    }
  });

  return progress;
}

export function getCurrentSection(questionIndex: number): QuestionCategory {
  return ASSESSMENT_QUESTIONS[questionIndex]?.category || "motivation";
}

// ── Hook ──

interface AssessmentState {
  currentQuestionIndex: number;
  answers: (AnswerData | null)[];
  isComplete: boolean;
  showPreResultsGate: boolean;
  startTime: number | null;
}

export function useAssessment() {
  const hasTrackedStart = useRef(false);

  const [state, setState] = useState<AssessmentState>({
    currentQuestionIndex: 0,
    answers: Array(ASSESSMENT_QUESTIONS.length).fill(null),
    isComplete: false,
    showPreResultsGate: false,
    startTime: null,
  });

  // Track assessment started on first render
  useEffect(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackEvent("assessment_started");
      setState((prev) => ({ ...prev, startTime: Date.now() }));
    }
  }, []);

  const currentQuestion = ASSESSMENT_QUESTIONS[state.currentQuestionIndex];

  const totalScore = useMemo(() => {
    return state.answers.reduce<number>((sum, answer) => sum + (answer?.score ?? 0), 0);
  }, [state.answers]);

  const answeredCount = useMemo(() => {
    return state.answers.filter((a) => a !== null).length;
  }, [state.answers]);

  const projectedGrade = useMemo(() => {
    return getProjectedGrade(totalScore, answeredCount);
  }, [totalScore, answeredCount]);

  const result = useMemo(() => {
    if (!state.isComplete) return null;
    return calculateResult(totalScore, state.answers);
  }, [state.isComplete, totalScore, state.answers]);

  const sectionProgress = useMemo(() => {
    return getSectionProgress(state.answers);
  }, [state.answers]);

  const currentSection = useMemo(() => {
    return getCurrentSection(state.currentQuestionIndex);
  }, [state.currentQuestionIndex]);

  // Get assessment context for Homi
  const getAssessmentContext = useCallback((): AssessmentContext => {
    const answeredQuestions = state.answers
      .map((answer, idx) => {
        if (!answer) return null;
        const q = ASSESSMENT_QUESTIONS[idx];
        const answerText = answer.isCustom
          ? (answer.customText || "Custom answer")
          : (q.options[answer.optionIndex]?.text || "");
        return {
          question: q.question,
          answer: answerText,
          score: answer.score,
          category: q.category,
          dimensions: answer.dimensions,
        };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null);

    const dimensionProfile = state.isComplete
      ? computeDimensionProfile(state.answers)
      : undefined;

    return {
      currentQuestion: state.currentQuestionIndex + 1,
      totalQuestions: ASSESSMENT_QUESTIONS.length,
      currentCategory: currentSection,
      answeredQuestions,
      currentScore: totalScore,
      maxPossibleScore: MAX_SCORE,
      projectedGrade,
      isComplete: state.isComplete,
      result: result || undefined,
      dimensionProfile,
    };
  }, [state, currentSection, totalScore, projectedGrade, result]);

  // Select answer (optionIndex 0-3 for fixed, 4 for custom)
  const selectAnswer = useCallback(
    (optionIndex: number, customText?: string) => {
      const question = ASSESSMENT_QUESTIONS[state.currentQuestionIndex];
      const isCustom = optionIndex === 4;

      let score: number;
      let dimensions: ProfileDimension[];

      if (isCustom) {
        score = CUSTOM_INPUT_SCORE;
        dimensions = []; // Custom answers don't tag dimensions
      } else {
        const selectedOption = question.options[optionIndex];
        score = selectedOption.score;
        dimensions = selectedOption.dimensions;
      }

      trackEvent("assessment_question_answered", {
        question_number: question.id,
        question_category: question.category,
        answer_score: score,
        answer_text: isCustom ? customText : question.options[optionIndex]?.text,
        is_custom: isCustom,
      });

      const newAnswers = [...state.answers];
      newAnswers[state.currentQuestionIndex] = {
        score,
        optionIndex,
        isCustom,
        customText: isCustom ? customText : undefined,
        dimensions,
      };

      const isLastQuestion = state.currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1;

      if (isLastQuestion) {
        setState((prev) => ({
          ...prev,
          answers: newAnswers,
          showPreResultsGate: true,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          answers: newAnswers,
        }));
      }
    },
    [state.currentQuestionIndex, state.answers]
  );

  const completeAssessment = useCallback(() => {
    const finalScore = state.answers.reduce<number>(
      (sum, answer) => sum + (answer?.score ?? 0),
      0
    );
    const finalResult = calculateResult(finalScore, state.answers);

    const timeToComplete = state.startTime
      ? Math.round((Date.now() - state.startTime) / 1000)
      : 0;

    trackEvent("assessment_completed", {
      total_score: finalScore,
      grade: finalResult.grade,
      dimension_profile: finalResult.dimensionProfile.tallies,
      time_to_complete_seconds: timeToComplete,
    });

    setState((prev) => ({
      ...prev,
      isComplete: true,
      showPreResultsGate: false,
    }));
  }, [state.answers, state.startTime]);

  const nextQuestion = useCallback(() => {
    if (state.currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  }, [state.currentQuestionIndex]);

  const previousQuestion = useCallback(() => {
    if (state.currentQuestionIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  }, [state.currentQuestionIndex]);

  const trackCtaClick = useCallback(
    (ctaType: "invite_coowner" | "talk_to_homi" | "learn_more") => {
      if (result) {
        trackEvent("assessment_cta_clicked", {
          grade: result.grade,
          cta_type: ctaType,
        });
      }
    },
    [result]
  );

  const trackShare = useCallback(
    (method: "native" | "copy") => {
      if (result) {
        trackEvent("assessment_shared", {
          grade: result.grade,
          method,
        });
      }
    },
    [result]
  );

  const restart = useCallback(() => {
    hasTrackedStart.current = false;
    setState({
      currentQuestionIndex: 0,
      answers: Array(ASSESSMENT_QUESTIONS.length).fill(null),
      isComplete: false,
      showPreResultsGate: false,
      startTime: null,
    });
  }, []);

  return {
    currentQuestionIndex: state.currentQuestionIndex,
    currentQuestion,
    totalQuestions: ASSESSMENT_QUESTIONS.length,
    answers: state.answers,
    isComplete: state.isComplete,
    showPreResultsGate: state.showPreResultsGate,
    result,
    totalScore,
    projectedGrade,

    currentSection,
    sectionProgress,
    categories: CATEGORIES,

    selectAnswer,
    completeAssessment,
    nextQuestion,
    previousQuestion,
    trackCtaClick,
    trackShare,
    restart,

    getAssessmentContext,

    progress: ((state.currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100,
    hasAnsweredCurrent: state.answers[state.currentQuestionIndex] !== null,
  };
}
