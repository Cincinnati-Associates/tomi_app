"use client";

import { motion } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Sparkles, Handshake, Infinity } from "lucide-react";
import { tomiDifferenceFeatures } from "@/content/questions";

const iconMap: Record<string, React.ElementType> = {
  Sparkles: Sparkles,
  Handshake: Handshake,
  Infinity: Infinity,
};

export function TomiDifference() {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Why do people co-buy homes with Tomi?
          </h2>
        </motion.div>

        {/* Features */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4 md:space-y-6">
            {tomiDifferenceFeatures.map((feature, index) => {
              const Icon = iconMap[feature.icon];

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4 md:gap-6 p-5 md:p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10">
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-lg md:text-xl font-semibold text-foreground mb-1 md:mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
