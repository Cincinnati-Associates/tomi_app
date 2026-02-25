"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import posthog from "posthog-js";

// Question categories
export type QuestionCategory = "the_why" | "the_who" | "the_what" | "the_money" | "the_readiness";

// Category metadata
export interface CategoryInfo {
  id: QuestionCategory;
  label: string;
  questionCount: number;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "the_why", label: "The Why", questionCount: 3 },
  { id: "the_who", label: "The Who", questionCount: 3 },
  { id: "the_what", label: "The What", questionCount: 3 },
  { id: "the_money", label: "The Money", questionCount: 3 },
  { id: "the_readiness", label: "The Readiness", questionCount: 2 },
];

// Homi transition messages between categories
export const CATEGORY_TRANSITIONS: Record<QuestionCategory, string> = {
  the_why: "Let's start with the big picture. No right answers here — just what's actually going through your head.",
  the_who: "Now the people part. Co-ownership is a relationship, and like any relationship, the right partner makes all the difference.",
  the_what: "Let's dream a little. What does your version of this actually look like?",
  the_money: "Alright, let's talk numbers. Not to judge — to be honest about where you stand. The whole point of co-ownership is that you don't have to do this alone financially.",
  the_readiness: "Last stretch. I want to know two things: what you know, and what you're most nervous about.",
};

// Input types for questions
export type InputType = "choice" | "hybrid" | "multiselect";

// Answer option type
export interface AnswerOption {
  text: string;
  score: number;
  value?: number | string; // For hybrid inputs - the numeric or text value this represents
}

// Hybrid options for financial and text questions
export interface HybridConfig {
  unit: "currency" | "currency_monthly" | "text";
  placeholder: string;
}

// Question type
export interface AssessmentQuestion {
  id: number;
  category: QuestionCategory;
  question: string;
  subtext?: string;
  inputType: InputType;
  options: AnswerOption[];
  hybridConfig?: HybridConfig;
  multiSelect?: boolean; // Allow selecting multiple options
  homiPrompt?: string; // Contextual prompt for Homi button
}

// Grade type
export type Grade = "A" | "B" | "C" | "D";

// Result type
export interface AssessmentResult {
  totalScore: number;
  maxScore: number;
  grade: Grade;
  title: string;
  message: string;
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

// Assessment questions data - 14 questions across 5 categories
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // ── Category 1: THE WHY (3 questions) — Tone: Curious guide ──
  {
    id: 1,
    category: "the_why",
    question: "What is it about homeownership that feels out of reach right now?",
    inputType: "choice",
    homiPrompt: "Is this normal?",
    options: [
      { text: "Prices — everything I want is out of my budget", score: 3 },
      { text: "The down payment — I can't save fast enough alone", score: 3 },
      { text: "Doing it alone feels overwhelming", score: 2 },
      { text: "Credit or debt is holding me back", score: 1 },
      { text: "I'm overwhelmed by the process itself", score: 1 },
      { text: "It's not out of reach — I'm ready to go", score: 3 },
    ],
  },
  {
    id: 2,
    category: "the_why",
    question: "Have you ever heard of co-ownership — buying a home with someone who isn't a spouse?",
    subtext: "Over 25% of recent home purchases involved co-buyers.",
    inputType: "choice",
    homiPrompt: "Tell me more",
    options: [
      { text: "Yes — I've been researching it", score: 3 },
      { text: "Vaguely — I've seen it mentioned", score: 2 },
      { text: "No, this is brand new to me", score: 1 },
      { text: "I'm already doing it (or have done it)", score: 3 },
    ],
  },
  {
    id: 3,
    category: "the_why",
    question: "What would change in your life if you owned a home with someone you trust?",
    inputType: "choice",
    homiPrompt: "Why does this matter?",
    options: [
      { text: "I'd finally start building real wealth", score: 3 },
      { text: "I'd stop paying someone else's mortgage", score: 3 },
      { text: "My family would have real stability", score: 2 },
      { text: "I'd have the space and freedom to live how I want", score: 2 },
      { text: "Honestly — I'm not sure yet, but I'm curious", score: 1 },
    ],
  },

  // ── Category 2: THE WHO (3 questions) — Tone: Warm therapist ──
  {
    id: 4,
    category: "the_who",
    question: "Do you have someone in mind you'd want to do this with?",
    inputType: "choice",
    homiPrompt: "How do I find one?",
    options: [
      { text: "Yes — we've talked about it seriously", score: 3 },
      { text: "I have someone in mind, haven't brought it up yet", score: 2 },
      { text: "A few people I could approach", score: 1 },
      { text: "No one yet — I'd need to find someone", score: 0 },
    ],
  },
  {
    id: 5,
    category: "the_who",
    question: "What's your relationship with your potential co-buyer(s)?",
    subtext: "Friends, family, partners, even acquaintances can make this work. Select all that apply.",
    inputType: "multiselect",
    multiSelect: true,
    homiPrompt: "Does this matter?",
    options: [
      { text: "Close friend (5+ years)", score: 3 },
      { text: "Family member", score: 3 },
      { text: "Romantic partner (not married)", score: 2 },
      { text: "Acquaintance or colleague", score: 1 },
      { text: "Haven't identified anyone yet", score: 0 },
    ],
  },
  {
    id: 6,
    category: "the_who",
    question: "Could you sit down with this person and talk about money without it getting weird?",
    inputType: "choice",
    homiPrompt: "Why does this matter?",
    options: [
      { text: "Absolutely — we're already open books", score: 3 },
      { text: "Yeah, I'd share what's necessary", score: 2 },
      { text: "Maybe — with the right framework", score: 1 },
      { text: "That would be... uncomfortable", score: 0 },
      { text: "I don't have anyone yet — help me think about this", score: 0 },
    ],
  },

  // ── Category 3: THE WHAT (3 questions) — Tone: Curious guide ──
  {
    id: 7,
    category: "the_what",
    question: "Picture your ideal shared home. What matters most to you?",
    inputType: "choice",
    homiPrompt: "Help me imagine",
    options: [
      { text: "Separate private spaces — my own door, my own world", score: 3 },
      { text: "Shared outdoor space and common areas", score: 2 },
      { text: "Location over size — I'll take less space in the right neighborhood", score: 2 },
      { text: "Investment potential — I want it to make financial sense", score: 3 },
      { text: "A place that feels like mine, even if it's shared", score: 2 },
    ],
  },
  {
    id: 8,
    category: "the_what",
    question: "Do you know where you want to put down roots?",
    inputType: "hybrid",
    homiPrompt: "Help me decide",
    hybridConfig: {
      unit: "text",
      placeholder: "Enter city or neighborhood",
    },
    options: [
      { text: "Yes — specific neighborhood or city", score: 3 },
      { text: "General area, flexible on specifics", score: 2 },
      { text: "A few areas I'm considering", score: 1 },
      { text: "No idea yet", score: 0 },
    ],
  },
  {
    id: 9,
    category: "the_what",
    question: "Have you ever bought a home before?",
    inputType: "choice",
    homiPrompt: "First-timer tips",
    options: [
      { text: "Nope — this would be my first", score: 2 },
      { text: "Yes, I've been through this before", score: 3 },
      { text: "I own now and would sell to co-buy", score: 3 },
      { text: "I own now and would keep it", score: 2 },
    ],
  },

  // ── Category 4: THE MONEY (3 questions) — Tone: Sharp friend ──
  {
    id: 10,
    category: "the_money",
    question: "How much could you put toward a down payment?",
    subtext: "With a co-buyer, your down payment is combined. $25k alone is $50k together.",
    inputType: "hybrid",
    homiPrompt: "How much do I need?",
    hybridConfig: {
      unit: "currency",
      placeholder: "Enter exact amount",
    },
    options: [
      { text: "$50,000 or more", score: 3, value: 50000 },
      { text: "$25,000 – $49,999", score: 2, value: 25000 },
      { text: "$10,000 – $24,999", score: 1, value: 10000 },
      { text: "Less than $10,000", score: 0, value: 0 },
    ],
  },
  {
    id: 11,
    category: "the_money",
    question: "What can you comfortably spend on housing each month?",
    inputType: "hybrid",
    homiPrompt: "Help me figure this out",
    hybridConfig: {
      unit: "currency_monthly",
      placeholder: "Enter exact amount",
    },
    options: [
      { text: "$3,000+ per month", score: 3, value: 3000 },
      { text: "$2,000 – $2,999 per month", score: 2, value: 2000 },
      { text: "$1,000 – $1,999 per month", score: 1, value: 1000 },
      { text: "Less than $1,000 per month", score: 0, value: 0 },
    ],
  },
  {
    id: 12,
    category: "the_money",
    question: "How's your credit looking these days?",
    subtext: "Not where you want it? That's fixable — and it doesn't disqualify you.",
    inputType: "choice",
    homiPrompt: "Will this affect me?",
    options: [
      { text: "Looking good — minimal debt, 750+ credit", score: 3 },
      { text: "Solid — manageable debt, 680–750 range", score: 2 },
      { text: "Working on it — some challenges", score: 1 },
      { text: "Honestly? I'd need to check", score: 0 },
    ],
  },

  // ── Category 5: THE READINESS (2 questions) — Tone: Playful + direct ──
  {
    id: 13,
    category: "the_readiness",
    question: "Pop quiz: what's the best ownership structure for unmarried co-buyers?",
    subtext: "Take your best guess!",
    inputType: "choice",
    homiPrompt: "What's a TIC?",
    options: [
      { text: "Tenants in Common (TIC)", score: 3 },
      { text: "Joint Tenancy", score: 1 },
      { text: "LLC Partnership", score: 2 },
      { text: "Honestly, no idea", score: 1 },
    ],
  },
  {
    id: 14,
    category: "the_readiness",
    question: "What's the thing you're most worried about with co-ownership?",
    inputType: "choice",
    homiPrompt: "Is this common?",
    options: [
      { text: "What if we disagree on big decisions?", score: 2 },
      { text: "What if someone can't pay their share?", score: 2 },
      { text: "What if I want out someday?", score: 2 },
      { text: "The legal complexity scares me", score: 1 },
      { text: "I don't know enough to know what to worry about", score: 1 },
    ],
  },
];

// Max possible score (14 questions, max 3 each = 42)
export const MAX_SCORE = 42;

// Calculate result based on score (max 42 points)
function calculateResult(totalScore: number): AssessmentResult {
  if (totalScore >= 35) {
    // 83%+ - Ready to go
    return {
      totalScore,
      maxScore: MAX_SCORE,
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
        text: "Talk to a Homi",
        type: "talk_to_homi",
        action: "open_chat",
      },
    };
  } else if (totalScore >= 26) {
    // 61-83% - Almost there
    return {
      totalScore,
      maxScore: MAX_SCORE,
      grade: "B",
      title: "Almost There",
      message:
        "You're on the right track! A few more conversations and decisions will get you ready. Homi can help you think through the details.",
      primaryCta: {
        text: "Talk to a Homi",
        href: "#",
        type: "talk_to_homi",
      },
      secondaryCta: {
        text: "Explore How It Works",
        href: "/co-ownership-history",
        type: "learn_more",
      },
    };
  } else if (totalScore >= 15) {
    // 36-61% - Getting started
    return {
      totalScore,
      maxScore: MAX_SCORE,
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
        text: "Talk to a Homi",
        type: "talk_to_homi",
        action: "open_chat",
      },
    };
  } else {
    // 0-36% - Just exploring
    return {
      totalScore,
      maxScore: MAX_SCORE,
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
        text: "Talk to a Homi",
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

  if (projectedTotal >= 35) return "A";
  if (projectedTotal >= 26) return "B";
  if (projectedTotal >= 15) return "C";
  return "D";
}

// Answer data stored for each question
export interface AnswerData {
  score: number;
  optionIndex: number;
  optionIndices?: number[]; // For multi-select questions
  exactValue?: number | string; // For hybrid inputs - the exact value entered
}

// Assessment state type
interface AssessmentState {
  currentQuestionIndex: number;
  answers: (AnswerData | null)[];
  isComplete: boolean;
  showPreResultsGate: boolean; // Show save/share CTA before results
  startTime: number | null;
}

// Context to pass to Homi
export interface AssessmentContext {
  currentQuestion: number;
  totalQuestions: number;
  currentCategory: string;
  answeredQuestions: {
    question: string;
    answer: string;
    score: number;
    category: string;
  }[];
  currentScore: number;
  maxPossibleScore: number;
  projectedGrade: Grade;
  isComplete: boolean;
  result?: AssessmentResult;
}

// Helper to track events safely
function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined" && posthog) {
    posthog.capture(eventName, properties);
  }
}

// Get category for a question index
export function getCategoryForQuestion(questionIndex: number): QuestionCategory {
  return ASSESSMENT_QUESTIONS[questionIndex]?.category || "the_why";
}

// Get section completion status
export function getSectionProgress(answers: (AnswerData | null)[]): Record<QuestionCategory, { completed: number; total: number }> {
  const progress: Record<QuestionCategory, { completed: number; total: number }> = {
    the_why: { completed: 0, total: 0 },
    the_who: { completed: 0, total: 0 },
    the_what: { completed: 0, total: 0 },
    the_money: { completed: 0, total: 0 },
    the_readiness: { completed: 0, total: 0 },
  };

  ASSESSMENT_QUESTIONS.forEach((q, idx) => {
    progress[q.category].total++;
    if (answers[idx] !== null) {
      progress[q.category].completed++;
    }
  });

  return progress;
}

// Check if a section is complete
export function isSectionComplete(category: QuestionCategory, answers: (AnswerData | null)[]): boolean {
  const progress = getSectionProgress(answers);
  return progress[category].completed === progress[category].total;
}

// Get current section based on question index
export function getCurrentSection(questionIndex: number): QuestionCategory {
  return ASSESSMENT_QUESTIONS[questionIndex]?.category || "the_why";
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

  // Current question
  const currentQuestion = ASSESSMENT_QUESTIONS[state.currentQuestionIndex];

  // Total score from answers
  const totalScore = useMemo(() => {
    return state.answers.reduce<number>((sum, answer) => sum + (answer?.score ?? 0), 0);
  }, [state.answers]);

  // Number of answered questions
  const answeredCount = useMemo(() => {
    return state.answers.filter((a) => a !== null).length;
  }, [state.answers]);

  // Projected grade
  const projectedGrade = useMemo(() => {
    return getProjectedGrade(totalScore, answeredCount);
  }, [totalScore, answeredCount]);

  // Result (only available when complete)
  const result = useMemo(() => {
    if (!state.isComplete) return null;
    return calculateResult(totalScore);
  }, [state.isComplete, totalScore]);

  // Section progress
  const sectionProgress = useMemo(() => {
    return getSectionProgress(state.answers);
  }, [state.answers]);

  // Current section
  const currentSection = useMemo(() => {
    return getCurrentSection(state.currentQuestionIndex);
  }, [state.currentQuestionIndex]);

  // Get assessment context for Homi
  const getAssessmentContext = useCallback((): AssessmentContext => {
    const answeredQuestions = state.answers
      .map((answer, idx) => {
        if (!answer) return null;
        const q = ASSESSMENT_QUESTIONS[idx];
        return {
          question: q.question,
          answer: q.options[answer.optionIndex]?.text || "",
          score: answer.score,
          category: q.category,
        };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null);

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
    };
  }, [state, currentSection, totalScore, projectedGrade, result]);

  // Select answer for current question (single or multi-select)
  const selectAnswer = useCallback(
    (optionIndex: number | number[], exactValue?: number | string) => {
      const question = ASSESSMENT_QUESTIONS[state.currentQuestionIndex];

      // Handle multi-select
      if (Array.isArray(optionIndex)) {
        const selectedOptions = optionIndex.map((idx) => question.options[idx]);
        // For multi-select, take the highest score among selected options
        const maxScore = Math.max(...selectedOptions.map((opt) => opt.score));

        // Track question answered
        trackEvent("assessment_question_answered", {
          question_number: question.id,
          question_category: question.category,
          answer_score: maxScore,
          answer_texts: selectedOptions.map((opt) => opt.text),
          is_multiselect: true,
        });

        // Update answers
        const newAnswers = [...state.answers];
        newAnswers[state.currentQuestionIndex] = {
          score: maxScore,
          optionIndex: optionIndex[0] ?? 0,
          optionIndices: optionIndex,
          exactValue,
        };

        // Check if this was the last question
        const isLastQuestion =
          state.currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1;

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
      } else {
        // Single select
        const selectedOption = question.options[optionIndex];

        // Track question answered
        trackEvent("assessment_question_answered", {
          question_number: question.id,
          question_category: question.category,
          answer_score: selectedOption.score,
          answer_text: selectedOption.text,
          exact_value: exactValue,
        });

        // Update answers
        const newAnswers = [...state.answers];
        newAnswers[state.currentQuestionIndex] = {
          score: selectedOption.score,
          optionIndex,
          exactValue,
        };

        // Check if this was the last question
        const isLastQuestion =
          state.currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1;

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
      }
    },
    [state.currentQuestionIndex, state.answers]
  );

  // Complete assessment (called from pre-results gate)
  const completeAssessment = useCallback(() => {
    // Calculate final score
    const finalScore = state.answers.reduce<number>(
      (sum, answer) => sum + (answer?.score ?? 0),
      0
    );
    const finalResult = calculateResult(finalScore);

    // Calculate time to complete
    const timeToComplete = state.startTime
      ? Math.round((Date.now() - state.startTime) / 1000)
      : 0;

    // Track completion
    trackEvent("assessment_completed", {
      total_score: finalScore,
      grade: finalResult.grade,
      time_to_complete_seconds: timeToComplete,
    });

    setState((prev) => ({
      ...prev,
      isComplete: true,
      showPreResultsGate: false,
    }));
  }, [state.answers, state.startTime]);

  // Advance to next question (called after animation)
  const nextQuestion = useCallback(() => {
    if (state.currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  }, [state.currentQuestionIndex]);

  // Go to previous question
  const previousQuestion = useCallback(() => {
    if (state.currentQuestionIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  }, [state.currentQuestionIndex]);

  // Track CTA click
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

  // Track share
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

  // Restart assessment
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
    // State
    currentQuestionIndex: state.currentQuestionIndex,
    currentQuestion,
    totalQuestions: ASSESSMENT_QUESTIONS.length,
    answers: state.answers,
    isComplete: state.isComplete,
    showPreResultsGate: state.showPreResultsGate,
    result,
    totalScore,
    projectedGrade,

    // Section tracking
    currentSection,
    sectionProgress,
    categories: CATEGORIES,

    // Actions
    selectAnswer,
    completeAssessment,
    nextQuestion,
    previousQuestion,
    trackCtaClick,
    trackShare,
    restart,

    // Context for Homi
    getAssessmentContext,

    // Computed
    progress: ((state.currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100,
    hasAnsweredCurrent: state.answers[state.currentQuestionIndex] !== null,
  };
}
