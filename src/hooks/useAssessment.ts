"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import posthog from "posthog-js";

// Question categories
export type QuestionCategory = "intent" | "cobuyer" | "living" | "financial" | "readiness";

// Category metadata
export interface CategoryInfo {
  id: QuestionCategory;
  label: string;
  questionCount: number;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "intent", label: "Vision", questionCount: 3 },
  { id: "cobuyer", label: "People", questionCount: 3 },
  { id: "living", label: "Lifestyle", questionCount: 1 },
  { id: "financial", label: "Finances", questionCount: 3 },
  { id: "readiness", label: "Readiness", questionCount: 1 },
];

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
  allowCustomAnswer?: boolean; // Show "type your own answer" option
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

// Assessment questions data - 11 questions across 5 categories
// Order: Aspiration → People → Living → Experience → Money → Fun closer
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Category 1: Intent (3 questions) - Start with dreams, not logistics
  {
    id: 1,
    category: "intent",
    question: "What's pulling you toward co-ownership?",
    inputType: "choice",
    homiPrompt: "Tell me more",
    allowCustomAnswer: true,
    options: [
      { text: "I want to stop renting and start building equity", score: 3 },
      { text: "I can't afford what I want on my own", score: 3 },
      { text: "I want to live near the people I love", score: 2 },
      { text: "I'm curious — just exploring", score: 1 },
    ],
  },
  {
    id: 2,
    category: "intent",
    question: "Picture your ideal (shared) home setup. What does it look like?",
    inputType: "choice",
    homiPrompt: "Help me imagine",
    allowCustomAnswer: true,
    options: [
      { text: "A house where I live full-time with my people", score: 3 },
      { text: "A vacation spot we all escape to", score: 2 },
      { text: "An investment property that makes us money", score: 2 },
      { text: "Honestly? I just want something that's mine", score: 1 },
    ],
  },
  {
    id: 3,
    category: "intent",
    question: "Do you know where you want to put down roots?",
    inputType: "hybrid",
    homiPrompt: "Help me decide",
    hybridConfig: {
      unit: "text",
      placeholder: "Enter city or neighborhood",
    },
    options: [
      { text: "Yes, specific neighborhood/city", score: 3 },
      { text: "General area, flexible on specifics", score: 2 },
      { text: "A few areas I'm considering", score: 1 },
      { text: "No idea yet", score: 0 },
    ],
  },
  // Category 2: Co-Buyer Situation (3 questions) - Who's coming along?
  {
    id: 4,
    category: "cobuyer",
    question: "Here's the big one: do you have someone in mind to do this with?",
    inputType: "choice",
    homiPrompt: "How do I find one?",
    allowCustomAnswer: true,
    options: [
      { text: "Yes, we've discussed it seriously", score: 3 },
      { text: "I have someone in mind, haven't asked yet", score: 2 },
      { text: "I have a few people I could approach", score: 1 },
      { text: "No, I'd need to find someone", score: 0 },
    ],
  },
  {
    id: 5,
    category: "cobuyer",
    question: "What's your relationship with your potential co-buyer(s)?",
    subtext: "Select all that apply",
    inputType: "multiselect",
    multiSelect: true,
    homiPrompt: "Does this matter?",
    allowCustomAnswer: true,
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
    category: "cobuyer",
    question: "Could you talk money with this person over dinner without it getting weird?",
    inputType: "choice",
    homiPrompt: "Why does this matter?",
    allowCustomAnswer: true,
    options: [
      { text: "Absolutely — we're already open books", score: 3 },
      { text: "Yeah, I'd share what's necessary", score: 2 },
      { text: "Maybe — with the right framework", score: 1 },
      { text: "That would be... uncomfortable", score: 0 },
    ],
  },
  // Category 3: Living/Lifestyle (1 question) — breather before money
  {
    id: 7,
    category: "living",
    question: "Have you ever bought a home before?",
    inputType: "choice",
    homiPrompt: "First-timer tips",
    options: [
      { text: "Nope, this would be my first", score: 2 },
      { text: "Yes, I've been through this rodeo", score: 3 },
      { text: "I own now and would sell to co-buy", score: 3 },
      { text: "I own now and would keep it", score: 2 },
    ],
  },
  // Category 4: Financial Readiness (3 questions) - Warmed up, now let's talk numbers
  {
    id: 8,
    category: "financial",
    question: "How much have you set aside for a down payment?",
    subtext: "For reference: 10% of a $500k home is $50k",
    inputType: "hybrid",
    homiPrompt: "How much do I need?",
    hybridConfig: {
      unit: "currency",
      placeholder: "Enter exact amount",
    },
    options: [
      { text: "$50,000 or more", score: 3, value: 50000 },
      { text: "$25,000 - $49,999", score: 2, value: 25000 },
      { text: "$10,000 - $24,999", score: 1, value: 10000 },
      { text: "Less than $10,000", score: 0, value: 0 },
    ],
  },
  {
    id: 9,
    category: "financial",
    question: "What can you comfortably spend on housing each month?",
    inputType: "hybrid",
    homiPrompt: "Help me figure this out",
    hybridConfig: {
      unit: "currency_monthly",
      placeholder: "Enter exact amount",
    },
    options: [
      { text: "$3,000+ per month", score: 3, value: 3000 },
      { text: "$2,000 - $2,999 per month", score: 2, value: 2000 },
      { text: "$1,000 - $1,999 per month", score: 1, value: 1000 },
      { text: "Less than $1,000 per month", score: 0, value: 0 },
    ],
  },
  {
    id: 10,
    category: "financial",
    question: "How's your credit looking these days?",
    inputType: "choice",
    homiPrompt: "Will this affect me?",
    options: [
      { text: "Looking good — minimal debt, 750+ credit", score: 3 },
      { text: "Solid — manageable debt, 680-750 range", score: 2 },
      { text: "Working on it — some challenges", score: 1 },
      { text: "Honestly? I'd need to check", score: 0 },
    ],
  },
  // Fun closer - ends on a light note
  {
    id: 11,
    category: "readiness",
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
];

// Max possible score (11 questions, max 3 each = 33)
export const MAX_SCORE = 33;

// Calculate result based on score (max 33 points)
function calculateResult(totalScore: number): AssessmentResult {
  if (totalScore >= 28) {
    // 85%+ - Ready to go
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
  } else if (totalScore >= 20) {
    // 61-85% - Almost there
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
  } else if (totalScore >= 12) {
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

  if (projectedTotal >= 30) return "A";
  if (projectedTotal >= 22) return "B";
  if (projectedTotal >= 13) return "C";
  return "D";
}

// Answer data stored for each question
export interface AnswerData {
  score: number;
  optionIndex: number; // -1 for custom text answers
  optionIndices?: number[]; // For multi-select questions
  exactValue?: number | string; // For hybrid inputs - the exact value entered
  customText?: string; // User's own typed answer (when optionIndex === -1)
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
  return ASSESSMENT_QUESTIONS[questionIndex]?.category || "intent";
}

// Get section completion status
export function getSectionProgress(answers: (AnswerData | null)[]): Record<QuestionCategory, { completed: number; total: number }> {
  const progress: Record<QuestionCategory, { completed: number; total: number }> = {
    intent: { completed: 0, total: 0 },
    cobuyer: { completed: 0, total: 0 },
    living: { completed: 0, total: 0 },
    financial: { completed: 0, total: 0 },
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

// Check if a section is complete
export function isSectionComplete(category: QuestionCategory, answers: (AnswerData | null)[]): boolean {
  const progress = getSectionProgress(answers);
  return progress[category].completed === progress[category].total;
}

// Get current section based on question index
export function getCurrentSection(questionIndex: number): QuestionCategory {
  return ASSESSMENT_QUESTIONS[questionIndex]?.category || "cobuyer";
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
        // Use customText for custom answers, otherwise look up the option text
        const answerText = answer.customText
          ? `(Custom) ${answer.customText}`
          : q.options[answer.optionIndex]?.text || "";
        return {
          question: q.question,
          answer: answerText,
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
      } else if (optionIndex === -1 && typeof exactValue === "string") {
        // Custom text answer
        trackEvent("assessment_question_answered", {
          question_number: question.id,
          question_category: question.category,
          answer_score: 2,
          answer_text: exactValue,
          is_custom_answer: true,
        });

        const newAnswers = [...state.answers];
        newAnswers[state.currentQuestionIndex] = {
          score: 2, // Neutral score for custom answers
          optionIndex: -1,
          customText: exactValue,
        };

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
