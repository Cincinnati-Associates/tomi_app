"use client";

import { motion } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface FinalCtaProps {
  onOpenChat: () => void;
}

export function FinalCta({ onOpenChat }: FinalCtaProps) {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 lg:py-32 bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Headline */}
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            Ready to see what&apos;s possible?
          </h2>

          {/* Subtext */}
          <p className="mt-4 text-primary-foreground/80 text-base md:text-lg max-w-2xl mx-auto">
            Take the first step toward owning the home you actually want.
          </p>

          {/* CTAs */}
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-8 text-primary hover:text-primary w-full sm:w-auto"
              asChild
            >
              <Link href="/calc">Start Your Journey</Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 bg-primary-foreground text-primary border-primary-foreground hover:bg-primary-foreground/90 w-full sm:w-auto"
              onClick={onOpenChat}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Talk to Homi
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
