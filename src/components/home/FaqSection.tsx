"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  faqItems,
  faqCategoryLabels,
  type FaqCategory,
  type FaqItem,
} from "@/content/faq";

function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen]);

  return (
    <div
      className="border-b border-border last:border-b-0"
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-primary"
        aria-expanded={isOpen}
      >
        <h3
          className="font-heading text-base font-semibold text-foreground md:text-lg pr-2"
          itemProp="name"
        >
          {item.question}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? height : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div
          ref={contentRef}
          itemScope
          itemProp="acceptedAnswer"
          itemType="https://schema.org/Answer"
        >
          <p
            className="pb-5 text-sm leading-relaxed text-muted-foreground md:text-base pr-8"
            itemProp="text"
          >
            {item.answer}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

const categories = Object.keys(faqCategoryLabels) as FaqCategory[];

interface FaqSectionProps {
  onOpenChat?: () => void;
}

export function FaqSection({ onOpenChat }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<FaqCategory | null>(
    null
  );

  const filteredItems = activeCategory
    ? faqItems.filter((item) => item.category === activeCategory)
    : faqItems;

  const handleToggle = useCallback(
    (index: number) => {
      setOpenIndex(openIndex === index ? null : index);
    },
    [openIndex]
  );

  const handleCategoryChange = useCallback(
    (category: FaqCategory | null) => {
      setActiveCategory(category);
      setOpenIndex(null);
    },
    []
  );

  return (
    <section
      className="py-16 md:py-24 lg:py-32 bg-background"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <FaqJsonLd items={faqItems} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <p className="text-primary font-medium text-sm uppercase tracking-wide mb-3">
            Co-Ownership FAQ
          </p>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Everything you need to know about buying a home together
          </h2>
        </motion.div>

        {/* Category filter chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-10 mt-6"
        >
          <button
            onClick={() => handleCategoryChange(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {faqCategoryLabels[cat]}
            </button>
          ))}
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-border bg-card px-5 md:px-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory ?? "all"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {filteredItems.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  item={item}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Homi CTA */}
        {onOpenChat && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground text-base md:text-lg mb-4">
              Got a different co-ownership question? Ask our shared home concierge.
            </p>
            <Button
              size="lg"
              variant="default"
              className="rounded-full px-8"
              onClick={onOpenChat}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat Now
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
