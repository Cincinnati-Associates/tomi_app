"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { usePageIntro } from "@/hooks/usePageIntro";
import { useIsMobile } from "@/hooks/useIsMobile";

interface PageIntroProps {
  pageId: string;
  title: string;
  description: string;
  bullets?: string[];
  ctaText?: string;
  enabled?: boolean;
}

/**
 * One-time typewriter effect for a string of text.
 * Respects prefers-reduced-motion by showing text immediately.
 */
function useTypeOnce(text: string, speed = 20, startDelay = 400) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setDisplayed(text);
      setIsDone(true);
      return;
    }

    let i = 0;
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, startDelay]);

  return { displayed, isDone };
}

/**
 * Desktop overlay content with Homi avatar, typewriter description,
 * staggered bullet reveals, and delayed CTA.
 */
function DesktopIntroContent({
  title,
  description,
  bullets,
  ctaText,
  dismiss,
}: {
  title: string;
  description: string;
  bullets?: string[];
  ctaText: string;
  dismiss: () => void;
}) {
  const { displayed: typedDescription, isDone: descDone } = useTypeOnce(
    description,
    20,
    400
  );
  const [visibleBullets, setVisibleBullets] = useState(0);

  useEffect(() => {
    if (!descDone || !bullets?.length) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleBullets(i);
      if (i >= bullets.length) clearInterval(interval);
    }, 350);
    return () => clearInterval(interval);
  }, [descDone, bullets?.length]);

  const showCta = bullets?.length ? visibleBullets >= bullets.length : descDone;

  return (
    <>
      {/* Homi header */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        </div>
        <span className="text-sm font-medium text-foreground">Homi</span>
        <button
          onClick={dismiss}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss intro"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 pb-6">
        <h2 className="text-lg font-heading font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 min-h-[2.5em]">
          {typedDescription}
          {!descDone && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block ml-0.5 w-[2px] h-[14px] bg-muted-foreground/60 align-middle"
            />
          )}
        </p>

        {bullets && bullets.length > 0 && (
          <ul className="mt-4 space-y-2">
            {bullets.map((bullet, index) => (
              <AnimatePresence key={index}>
                {index < visibleBullets && (
                  <motion.li
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{bullet}</span>
                  </motion.li>
                )}
              </AnimatePresence>
            ))}
          </ul>
        )}

        <AnimatePresence>
          {showCta && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-5 flex items-center justify-center gap-4"
            >
              <Button onClick={dismiss}>{ctaText}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/**
 * Page introduction component that shows on first visit.
 * Mobile: Bottom sheet (Drawer) with Homi avatar
 * Desktop: Overlay modal with Homi avatar, typewriter effect, staggered bullets
 */
export function PageIntro({
  pageId,
  title,
  description,
  bullets,
  ctaText = "Let's Go",
  enabled = true,
}: PageIntroProps) {
  const { isOpen, dismiss } = usePageIntro({ pageId, enabled });
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  // Mobile: Bottom Sheet Drawer with Homi avatar
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && dismiss()}>
        <DrawerContent className="z-[70]">
          <DrawerHeader className="text-left">
            <div className="flex items-center gap-3 mb-1">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border-[1.5px] border-background" />
              </div>
              <span className="text-xs text-muted-foreground">Homi</span>
            </div>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            {bullets && bullets.length > 0 && (
              <ul className="mt-4 space-y-2">
                {bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DrawerFooter className="pb-8">
            <Button onClick={dismiss} className="w-full" size="lg">
              {ctaText}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Overlay modal with backdrop
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative rounded-2xl border bg-card shadow-xl max-w-md mx-4 overflow-hidden homi-card-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <DesktopIntroContent
              title={title}
              description={description}
              bullets={bullets}
              ctaText={ctaText}
              dismiss={dismiss}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
