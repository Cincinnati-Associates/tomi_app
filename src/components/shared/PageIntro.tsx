"use client";

import { CheckCircle, X } from "lucide-react";
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
 * Page introduction component that shows on first visit.
 * Mobile: Bottom sheet (Drawer)
 * Desktop: Centered dismissible card
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

  // Mobile: Bottom Sheet Drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && dismiss()}>
        <DrawerContent>
          <DrawerHeader className="text-left">
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
            <button
              onClick={dismiss}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
            >
              Dismiss
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Centered card
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="mb-6"
        >
          <div className="relative rounded-2xl border bg-card p-8 shadow-lg max-w-md mx-auto text-center">
            {/* Close button */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss intro"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {description}
            </p>

            {bullets && bullets.length > 0 && (
              <ul className="mt-4 space-y-2 inline-flex flex-col items-start">
                {bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* CTA */}
            <div className="mt-5 flex items-center justify-center gap-4">
              <Button onClick={dismiss}>{ctaText}</Button>
              <button
                onClick={dismiss}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip intro
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
