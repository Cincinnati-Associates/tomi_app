"use client";

import { motion } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Sparkles, FileText, TrendingUp, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

const whatYouGet = [
  { icon: Sparkles, label: "AI-powered guidance" },
  { icon: FileText, label: "Legal agreements" },
  { icon: Shield, label: "Ongoing support" },
  { icon: TrendingUp, label: "Equity tracking" },
];

export function NoCostSection() {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-primary/5 overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* The hook */}
          <p className="text-primary font-medium text-sm md:text-base uppercase tracking-wide mb-4">
            A new kind of partnership
          </p>

          {/* Main message */}
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
            $0 upfront. <span className="text-primary">1% when you sell.</span>
          </h2>

          {/* Explanation */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8"
          >
            We take a 1% stake in your home—realized only when you sell.
            <br className="hidden sm:block" />
            <span className="font-medium text-foreground">That means we win when your home grows in value. Not before.</span>
          </motion.p>

          {/* What you get */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8"
          >
            {whatYouGet.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border"
              >
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Why this matters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-card border border-border rounded-2xl p-6 max-w-xl mx-auto mb-8"
          >
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              <span className="font-semibold text-foreground">Why does this matter?</span>
              {" "}Most platforms charge fees upfront—whether your co-ownership works out or not.
              Our model means we&apos;re invested in your success for the long haul.
              We don&apos;t disappear after you sign. We&apos;re your partner until you sell.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors"
            >
              See how it works
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
