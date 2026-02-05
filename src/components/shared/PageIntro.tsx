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
 * Desktop: Dismissible card at top of page
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

  if (!isOpen) return null;

  // Shared content for both mobile and desktop
  const IntroContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {bullets && bullets.length > 0 && (
        <ul className={`space-y-2 ${isMobile ? "mt-4" : "mt-3"}`}>
          {bullets.map((bullet, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <>
      {/* Mobile: Bottom Sheet Drawer */}
      <div className="md:hidden">
        <Drawer open={isOpen} onOpenChange={(open) => !open && dismiss()}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <IntroContent isMobile />
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
      </div>

      {/* Desktop: Dismissible Card */}
      <div className="hidden md:block">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <div className="relative rounded-2xl border bg-card p-6 shadow-lg max-w-2xl mx-auto">
                {/* Close button */}
                <button
                  onClick={dismiss}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Dismiss intro"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="pr-8">
                  <h2 className="text-lg font-semibold">{title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                  <IntroContent />
                </div>

                {/* CTA */}
                <div className="mt-4 flex items-center gap-4">
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
      </div>
    </>
  );
}
