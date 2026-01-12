"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type TypewriterState = "typing" | "paused" | "deleting" | "switching";

interface UseTypewriterOptions {
  texts: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseAfterType?: number;
  pauseAfterDelete?: number;
  loop?: boolean;
}

interface UseTypewriterReturn {
  displayText: string;
  fullText: string;
  currentTextIndex: number;
  isComplete: boolean;
  state: TypewriterState;
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
}

export function useTypewriter({
  texts,
  typeSpeed = 50,
  deleteSpeed = 30,
  pauseAfterType = 2500,
  pauseAfterDelete = 500,
  loop = true,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayText, setDisplayText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [state, setState] = useState<TypewriterState>("typing");
  const [isPaused, setIsPaused] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentFullText = texts[currentTextIndex];
  const isComplete = displayText === currentFullText;

  const clearCurrentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    clearCurrentTimeout();
  }, [clearCurrentTimeout]);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Skip animation, just show full text and rotate
      setDisplayText(currentFullText);
      setState("paused");
      timeoutRef.current = setTimeout(() => {
        const nextIndex = (currentTextIndex + 1) % texts.length;
        if (!loop && nextIndex === 0) return;
        setCurrentTextIndex(nextIndex);
      }, pauseAfterType);
      return clearCurrentTimeout;
    }

    switch (state) {
      case "typing":
        if (displayText.length < currentFullText.length) {
          timeoutRef.current = setTimeout(() => {
            setDisplayText(currentFullText.slice(0, displayText.length + 1));
          }, typeSpeed);
        } else {
          setState("paused");
        }
        break;

      case "paused":
        timeoutRef.current = setTimeout(() => {
          setState("deleting");
        }, pauseAfterType);
        break;

      case "deleting":
        if (displayText.length > 0) {
          timeoutRef.current = setTimeout(() => {
            setDisplayText(displayText.slice(0, -1));
          }, deleteSpeed);
        } else {
          setState("switching");
        }
        break;

      case "switching":
        timeoutRef.current = setTimeout(() => {
          const nextIndex = (currentTextIndex + 1) % texts.length;
          if (!loop && nextIndex === 0) {
            return;
          }
          setCurrentTextIndex(nextIndex);
          setState("typing");
        }, pauseAfterDelete);
        break;
    }

    return clearCurrentTimeout;
  }, [
    state,
    displayText,
    currentFullText,
    currentTextIndex,
    texts.length,
    typeSpeed,
    deleteSpeed,
    pauseAfterType,
    pauseAfterDelete,
    loop,
    isPaused,
    clearCurrentTimeout,
    texts,
  ]);

  return {
    displayText,
    fullText: currentFullText,
    currentTextIndex,
    isComplete,
    state,
    pause,
    resume,
    isPaused,
  };
}
