"use client";

import { useEffect, useRef } from "react";
import { getStoredAssessment, clearStoredAssessment } from "@/lib/assessment-context";

// Map Q12 optionIndex (0-3) to timeline values matching the journey schema
const TIMELINE_MAP: Record<number, string> = {
  0: "6mo",       // "Within the next 6 months"
  1: "12mo",      // "6–12 months from now"
  2: "18mo+",     // "1–2 years — building toward it"
  3: "exploring",  // "Just exploring — no timeline"
};

// Map Q4 optionIndex (0-3) to co-buyer status values
const COBUYER_STATUS_MAP: Record<number, string> = {
  0: "has_cobuyers", // "Yes — my spouse or partner"
  1: "has_cobuyers", // "Yes — a family member"
  2: "has_cobuyers", // "Yes — a close friend or someone I trust"
  3: "seeking",      // "Not yet — I'd need to find the right person"
};

/**
 * Auto-links pending assessment data from sessionStorage to the user's journey
 * and marks onboarding as complete. Runs once after signup when landing on /journey.
 *
 * Assessment carry-forward mapping:
 * - Q12 (index 11) → targetTimeline on journey
 * - Q4 (index 3) → coBuyerStatus on journey
 * - dimensionProfile + customAnswers → stored on journey's targetMarkets (as metadata)
 */
export function useAssessmentLinker(isAuthenticated: boolean) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || hasRun.current) return;

    const assessment = getStoredAssessment();
    if (!assessment) return;

    hasRun.current = true;

    async function linkAssessment() {
      try {
        const { answers, dimensionProfile, customAnswers, grade, score } = assessment!;

        // Extract carry-forward data from assessment answers
        // Q12 (index 11) = timeline, Q4 (index 3) = co-buyer status
        const timelineAnswer = answers?.[11];
        const coBuyerAnswer = answers?.[3];

        const targetTimeline = timelineAnswer
          ? (timelineAnswer.isCustom ? "exploring" : TIMELINE_MAP[timelineAnswer.optionIndex])
          : undefined;
        const coBuyerStatus = coBuyerAnswer
          ? (coBuyerAnswer.isCustom ? "open" : COBUYER_STATUS_MAP[coBuyerAnswer.optionIndex])
          : undefined;

        // Build journey update payload
        const journeyUpdate: Record<string, unknown> = {};
        if (targetTimeline) journeyUpdate.targetTimeline = targetTimeline;
        if (coBuyerStatus) journeyUpdate.coBuyerStatus = coBuyerStatus;

        // Store assessment metadata in targetMarkets (jsonb field)
        // This piggybacks on the existing field to avoid a migration
        journeyUpdate.targetMarkets = [{
          _assessment_linked: true,
          _assessment_grade: grade,
          _assessment_score: score,
          _dimension_profile: dimensionProfile ?? null,
          _custom_answers: customAnswers ?? null,
          _linked_at: new Date().toISOString(),
        }];

        // Update journey record with assessment data
        if (Object.keys(journeyUpdate).length > 0) {
          await fetch("/api/journey", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(journeyUpdate),
          });
        }

        // Mark onboarding as complete (skip the 3-page onboarding flow)
        await fetch("/api/users/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ onboardingCompleted: true }),
        });

        // Clear sessionStorage
        clearStoredAssessment();
      } catch (error) {
        console.error("[useAssessmentLinker] Failed to link assessment:", error);
        // Don't clear storage on failure — let it retry next page load
        hasRun.current = false;
      }
    }

    linkAssessment();
  }, [isAuthenticated]);
}
