"use client";

import { motion } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: "default" | "secondary" | "primary";
}

export function SectionWrapper({
  children,
  className,
  id,
  background = "default",
}: SectionWrapperProps) {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.1 });

  const bgStyles = {
    default: "bg-background",
    secondary: "bg-secondary/30",
    primary: "bg-primary text-primary-foreground",
  };

  return (
    <section
      id={id}
      ref={ref}
      className={cn("py-16 md:py-24 lg:py-32", bgStyles[background], className)}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {children}
      </motion.div>
    </section>
  );
}
