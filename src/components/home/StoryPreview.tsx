"use client";

import { motion } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function StoryPreview() {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-card border border-border"
        >
          <div className="grid md:grid-cols-2">
            {/* Image placeholder */}
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[400px] bg-gradient-to-br from-primary/20 via-accent/10 to-secondary">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">👥🏠</div>
                  <p className="text-sm text-muted-foreground">
                    Story photo coming soon
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
              <div className="space-y-6">
                {/* Quote */}
                <blockquote className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  &quot;We bought a $650K home on $75K salaries&quot;
                </blockquote>

                {/* Description */}
                <p className="text-muted-foreground text-base md:text-lg">
                  Alex & Jordan were priced out of their city—until they
                  discovered they didn&apos;t have to buy alone.
                </p>

                {/* CTA */}
                <Button
                  variant="outline"
                  className="rounded-full group w-fit"
                  asChild
                >
                  <Link href="/stories/alex-and-jordan">
                    Read Their Story
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
