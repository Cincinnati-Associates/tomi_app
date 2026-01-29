"use client";

import { motion } from "framer-motion";
import { MessageCircle, CheckCircle2, FileText, Check, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Discuss",
    subtitle: "Have the hard conversations early",
    description:
      "Exit rules. Buyout terms. What happens if someone stops paying. Our AI—trained on real TIC agreements and legal precedents—guides you through every scenario when the stakes are hypothetical, not heated.",
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "Decide",
    subtitle: "Lock in your decisions together",
    description:
      "Work through each topic with your co-buyers. Tomi captures your answers and flags where you disagree—so you can resolve differences before they become disputes.",
    icon: CheckCircle2,
  },
  {
    number: "03",
    title: "Draft",
    subtitle: "Generate your agreement instantly",
    description:
      "Your decisions become a plain-English Co-Ownership Agreement. Take it to an attorney for review, or use it as-is. Either way, you'll save thousands and actually understand what you're signing.",
    icon: FileText,
  },
];

const coverageItems = [
  "Exit & buyout rules",
  "Decision-making process",
  "Payment responsibilities",
  "Repairs & improvements",
  "Dispute resolution",
  "Guest & rental policies",
];

export function AgreementSection() {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 bg-background overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            How Much Does a Co-Ownership Agreement Cost?
          </h2>
          <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-3xl mx-auto">
            Traditional TIC agreements cost $3,000–$8,000 in legal fees. We&apos;ve trained AI on thousands of co-ownership contracts and legal filings to help you navigate the hard conversations—and draft your agreement—for free.
          </p>
        </motion.div>

        {/* Three-step process */}
        <div className="grid gap-6 md:grid-cols-3 md:gap-8 mb-12 md:mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative bg-card rounded-2xl border border-border p-6 md:p-8"
              >
                {/* Step number badge */}
                <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-heading text-xl font-bold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm font-medium text-primary mb-3">
                  {step.subtitle}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Connector line (desktop only, not on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[2px] bg-border" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-secondary/30 rounded-2xl p-6 md:p-8 mb-8"
        >
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4 text-center">
            What Your Agreement Covers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {coverageItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Attorney network note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8"
        >
          <Scale className="w-4 h-4 text-primary" />
          <span>
            Need an attorney to review your agreement? We&apos;ll connect you with a co-ownership specialist from our network across the US.
          </span>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <Button variant="glow" size="lg" className="rounded-full px-8" asChild>
            <Link href="/tic-builder">Start Your Agreement — Free</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
