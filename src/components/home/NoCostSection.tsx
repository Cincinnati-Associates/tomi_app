"use client";

import { motion } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { DollarSign, FileText, Calculator, Home, ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  { icon: FileText, label: "Legal agreements" },
  { icon: Calculator, label: "Financial planning" },
  { icon: DollarSign, label: "Financing strategy" },
  { icon: Home, label: "Property management" },
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
            And what if we told you...
          </p>

          {/* Main message */}
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            You don&apos;t pay us anything
            <br />
            <span className="text-primary">until you sell</span>.
          </h2>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border"
              >
                <service.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{service.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-8"
          >
            Think of Tomi as your shared home concierge—that&apos;s also a partner,
            because we only succeed when you do.
          </motion.p>

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
