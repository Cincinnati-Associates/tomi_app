import type { Grade, AnswerData } from "@/hooks/useAssessment";

export interface StoredAssessment {
  grade: Grade;
  score: number;
  answers: (AnswerData | null)[];
  timestamp?: number;
}

const STORAGE_KEY = "pendingAssessment";

/**
 * Get stored assessment data from sessionStorage
 */
export function getStoredAssessment(): StoredAssessment | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Clear stored assessment data
 */
export function clearStoredAssessment(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * Build a context summary from assessment answers for Homi
 */
export function buildAssessmentContextForHomi(assessment: StoredAssessment): string {
  const { grade, score, answers } = assessment;

  const gradeDescriptions: Record<Grade, string> = {
    A: "highly ready for co-ownership",
    B: "mostly ready but has some areas to work on",
    C: "has potential but needs preparation",
    D: "in early exploration stages",
  };

  // Build summary based on grade and score
  const contextParts = [
    `This user recently completed the co-ownership readiness assessment.`,
    `Grade: ${grade} (${gradeDescriptions[grade]})`,
    `Score: ${score}/42`,
  ];

  // Add insights based on score ranges for different areas
  const insights: string[] = [];

  // Calculate rough category insights from answer indices
  // Questions are organized: the_why (0-2), the_who (3-5), the_what (6-8), the_money (9-11), the_readiness (12-13)
  const whyScores = answers.slice(0, 3).filter(Boolean).reduce((sum, a) => sum + (a?.score || 0), 0);
  const whoScores = answers.slice(3, 6).filter(Boolean).reduce((sum, a) => sum + (a?.score || 0), 0);
  const whatScores = answers.slice(6, 9).filter(Boolean).reduce((sum, a) => sum + (a?.score || 0), 0);
  const moneyScores = answers.slice(9, 12).filter(Boolean).reduce((sum, a) => sum + (a?.score || 0), 0);
  const readinessScores = answers.slice(12, 14).filter(Boolean).reduce((sum, a) => sum + (a?.score || 0), 0);

  // Max possible: the_why 9, the_who 9, the_what 9, the_money 9, the_readiness 6
  if (whyScores >= 7) insights.push("Strong motivation and understanding of co-ownership benefits");
  else if (whyScores <= 3) insights.push("Still exploring what co-ownership means for them - good area for education");

  if (whoScores >= 7) insights.push("Has co-buyers identified with good relationship clarity");
  else if (whoScores <= 3) insights.push("Co-buyer situation unclear - may need help finding or evaluating co-buyers");

  if (whatScores >= 7) insights.push("Clear vision for their shared home and experienced with home buying");
  else if (whatScores <= 3) insights.push("Still forming their vision - help them explore what shared living could look like");

  if (moneyScores >= 7) insights.push("Strong financial readiness");
  else if (moneyScores <= 3) insights.push("Financial preparation may need work - discuss savings, debt, or credit");

  if (readinessScores >= 4) insights.push("Good knowledge base and aware of their concerns");
  else if (readinessScores <= 2) insights.push("May have concerns or knowledge gaps - explore what's holding them back");

  if (insights.length > 0) {
    contextParts.push(`\nKey observations from their answers:`);
    insights.forEach((insight) => contextParts.push(`- ${insight}`));
  }

  contextParts.push(
    `\nUse this context to provide personalized advice. Ask follow-up questions about areas where they may need help or seem uncertain.`
  );

  return contextParts.join("\n");
}

/**
 * Get grade-specific conversation starters for Homi
 */
export function getGradeBasedPrompts(grade: Grade): string[] {
  const prompts: Record<Grade, string[]> = {
    A: [
      "You seem well-prepared! Have you started looking at specific properties yet?",
      "What's your timeline for making an offer?",
      "Have you and your co-buyer discussed how you'll handle decisions about the property?",
    ],
    B: [
      "You're in a great position. What areas would you like to strengthen before moving forward?",
      "Have you had detailed financial conversations with your potential co-buyer?",
      "What questions do you still have about the co-buying process?",
    ],
    C: [
      "You have good potential! What's holding you back from feeling fully ready?",
      "Do you have a specific co-buyer in mind, or are you still exploring options?",
      "Would you like to understand more about how co-ownership agreements work?",
    ],
    D: [
      "Great that you're exploring co-ownership early! What sparked your interest?",
      "What would help you feel more confident about co-buying?",
      "Do you have questions about whether co-ownership is right for your situation?",
    ],
  };

  return prompts[grade];
}
