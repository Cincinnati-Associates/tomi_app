"use client";

import { useState, useEffect, useCallback } from "react";

interface UsePageIntroOptions {
  pageId: string;
  enabled?: boolean;
}

interface UsePageIntroReturn {
  isOpen: boolean;
  dismiss: () => void;
  reset: () => void;
}

const STORAGE_KEY_PREFIX = "page-intro-dismissed-";

/**
 * Hook for managing page intro visibility with localStorage persistence.
 * SSR-safe: only checks localStorage in useEffect.
 */
export function usePageIntro({
  pageId,
  enabled = true,
}: UsePageIntroOptions): UsePageIntroReturn {
  // Start closed to avoid flash on SSR
  const [isOpen, setIsOpen] = useState(false);

  const storageKey = `${STORAGE_KEY_PREFIX}${pageId}`;

  // Check localStorage on mount
  useEffect(() => {
    if (!enabled) return;

    try {
      const dismissed = localStorage.getItem(storageKey);
      if (dismissed !== "true") {
        setIsOpen(true);
      }
    } catch {
      // localStorage unavailable, show intro
      setIsOpen(true);
    }
  }, [storageKey, enabled]);

  const dismiss = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // localStorage unavailable, just close
    }
  }, [storageKey]);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setIsOpen(true);
    } catch {
      // localStorage unavailable
    }
  }, [storageKey]);

  return { isOpen, dismiss, reset };
}
