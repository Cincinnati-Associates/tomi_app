"use client";

import { useState, useCallback } from "react";
import {
  StoryStep,
  getStepById,
  getFirstStep,
  TOTAL_CHAPTERS,
} from "@/content/story-steps";

interface StoryResponse {
  stepId: string;
  response: string;
  timestamp: number;
}

interface UseStoryProgressReturn {
  currentStep: StoryStep;
  chapter: number;
  totalChapters: number;
  responses: StoryResponse[];
  isComplete: boolean;
  progress: number; // 0-100 percentage through story

  // Actions
  advance: (response?: string) => void;
  goToStep: (stepId: string) => void;
  restart: () => void;

  // Helpers
  getResponseForStep: (stepId: string) => string | undefined;
}

export function useStoryProgress(): UseStoryProgressReturn {
  const [currentStep, setCurrentStep] = useState<StoryStep>(getFirstStep());
  const [responses, setResponses] = useState<StoryResponse[]>([]);
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set([getFirstStep().id]));

  const isComplete = currentStep.nextStep === null;

  // Calculate progress as percentage through story
  const progress = Math.round((visitedSteps.size / 14) * 100); // 14 total steps

  const advance = useCallback((response?: string) => {
    // Store response if provided
    if (response) {
      setResponses((prev) => [
        ...prev,
        {
          stepId: currentStep.id,
          response,
          timestamp: Date.now(),
        },
      ]);
    }

    // Determine next step
    let nextStepId: string | null = null;

    if (currentStep.getNextStep && response) {
      nextStepId = currentStep.getNextStep(response);
    } else {
      nextStepId = currentStep.nextStep;
    }

    if (nextStepId) {
      const nextStep = getStepById(nextStepId);
      if (nextStep) {
        setCurrentStep(nextStep);
        setVisitedSteps((prev) => {
          const newSet = new Set(Array.from(prev));
          newSet.add(nextStepId!);
          return newSet;
        });
      }
    }
  }, [currentStep]);

  const goToStep = useCallback((stepId: string) => {
    const step = getStepById(stepId);
    if (step) {
      setCurrentStep(step);
      setVisitedSteps((prev) => {
        const newSet = new Set(Array.from(prev));
        newSet.add(stepId);
        return newSet;
      });
    }
  }, []);

  const restart = useCallback(() => {
    const firstStep = getFirstStep();
    setCurrentStep(firstStep);
    setResponses([]);
    setVisitedSteps(new Set([firstStep.id]));
  }, []);

  const getResponseForStep = useCallback((stepId: string): string | undefined => {
    return responses.find((r) => r.stepId === stepId)?.response;
  }, [responses]);

  return {
    currentStep,
    chapter: currentStep.chapter,
    totalChapters: TOTAL_CHAPTERS,
    responses,
    isComplete,
    progress,
    advance,
    goToStep,
    restart,
    getResponseForStep,
  };
}
