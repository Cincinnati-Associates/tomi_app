import type { Grade, AnswerData, DimensionProfile, CustomAnswer, ProfileDimension } from "@/lib/assessment-types";
import { DIMENSION_LABELS, DIMENSION_DESCRIPTIONS, MAX_SCORE, computeDimensionProfile } from "@/lib/assessment-types";

export interface StoredAssessment {
  grade: Grade;
  score: number;
  answers: (AnswerData | null)[];
  dimensionProfile?: DimensionProfile;
  customAnswers?: CustomAnswer[];
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

  // Compute dimension profile if not already stored
  const profile = assessment.dimensionProfile ?? computeDimensionProfile(answers);
  const customAnswers = assessment.customAnswers ?? [];

  const gradeDescriptions: Record<Grade, string> = {
    A: "highly ready for co-ownership",
    B: "mostly ready but has some areas to work on",
    C: "has potential but needs preparation",
    D: "in early exploration stages",
  };

  const contextParts = [
    `This user recently completed the co-ownership readiness assessment.`,
    `Grade: ${grade} (${gradeDescriptions[grade]})`,
    `Score: ${score}/${MAX_SCORE}`,
  ];

  // Dimension profile — strengths and growth areas
  if (profile.primaryConcerns.length > 0) {
    const strengthLabels = profile.primaryConcerns
      .map((d: ProfileDimension) => `${DIMENSION_LABELS[d]} — ${DIMENSION_DESCRIPTIONS[d].strong}`)
      .join("; ");
    contextParts.push(`\nStrengths: ${strengthLabels}`);
  }

  if (profile.growthAreas.length > 0) {
    const growthLabels = profile.growthAreas
      .map((d: ProfileDimension) => `${DIMENSION_LABELS[d]} — ${DIMENSION_DESCRIPTIONS[d].weak}`)
      .join("; ");
    contextParts.push(`Growth areas: ${growthLabels}`);
  }

  // Custom answers — the user's own words
  if (customAnswers.length > 0) {
    contextParts.push(`\nThe user provided their own answers to some questions:`);
    customAnswers.forEach((ca) => {
      contextParts.push(`- "${ca.text}"`);
    });
  }

  contextParts.push(
    `\nUse this dimension profile to personalize advice. Focus on their growth areas while acknowledging their strengths. Reference their custom answers naturally if relevant.`
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
