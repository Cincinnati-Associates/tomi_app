"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, MotionValue, useTransform } from "framer-motion";
import { Ship, Zap, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Era {
  id: string;
  year: string;
  title: string;
  description: string;
  icon: React.ElementType;
  bgClass: string;
}

const ERAS: Era[] = [
  {
    id: "1600s",
    year: "1600s",
    title: "Joint-Stock Companies",
    description: "Ships and trade routes let strangers pool capital across oceans",
    icon: Ship,
    bgClass: "from-amber-900/30 to-amber-800/20",
  },
  {
    id: "1900s",
    year: "1900s",
    title: "The Electric Age",
    description: "Electricity reorganized how we work and build together",
    icon: Zap,
    bgClass: "from-yellow-600/30 to-orange-500/20",
  },
  {
    id: "2000s",
    year: "2000s",
    title: "The Information Age",
    description: "The internet organized the world's information",
    icon: Search,
    bgClass: "from-blue-600/30 to-cyan-500/20",
  },
  {
    id: "2020s",
    year: "2020s",
    title: "The AI Age",
    description: "AI organizes goals, finances, and lifestyles",
    icon: Sparkles,
    bgClass: "from-primary/30 to-accent/20",
  },
];

interface Frame5TechnologyProps {
  progress: MotionValue<number>;
  isActive: boolean;
}

function EraCard({ era }: { era: Era }) {
  const Icon = era.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -30 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden",
        "bg-gradient-to-br",
        era.bgClass
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_white_1px,_transparent_1px)] bg-[size:20px_20px]" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
        {/* Year badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <span className="text-5xl md:text-7xl font-heading font-bold text-foreground/90">
            {era.year}
          </span>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center mb-6"
        >
          <Icon className="w-10 h-10 md:w-12 md:h-12 text-foreground" />
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3"
        >
          {era.title}
        </motion.h3>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-base md:text-lg text-foreground/80 max-w-sm"
        >
          {era.description}
        </motion.p>
      </div>

      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        animate={{
          boxShadow: [
            "inset 0 0 30px rgba(255,255,255,0.1)",
            "inset 0 0 50px rgba(255,255,255,0.2)",
            "inset 0 0 30px rgba(255,255,255,0.1)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function TimelineIndicator({ currentIndex, total }: { currentIndex: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mt-8">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i === currentIndex ? "bg-primary w-8" : "bg-muted-foreground/30 w-1.5"
          )}
          layout
        />
      ))}
    </div>
  );
}

export function Frame5Technology({ progress, isActive }: Frame5TechnologyProps) {
  const [currentEraIndex, setCurrentEraIndex] = useState(0);

  const advanceEra = useCallback(() => {
    setCurrentEraIndex((prev) => (prev + 1) % ERAS.length);
  }, []);

  // Auto-advance every 2.5 seconds when active
  useEffect(() => {
    if (!isActive) {
      setCurrentEraIndex(0);
      return;
    }

    const interval = setInterval(advanceEra, 2500);
    return () => clearInterval(interval);
  }, [isActive, advanceEra]);

  const currentEra = ERAS[currentEraIndex];
  const titleOpacity = useTransform(progress, [0, 0.15], [0, 1]);
  const contentOpacity = useTransform(progress, [0.1, 0.3], [0, 1]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 md:px-12">
      <div className="max-w-4xl w-full flex flex-col items-center">
        {/* Title */}
        <motion.h2
          className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-foreground text-center mb-4"
          style={{ opacity: titleOpacity }}
        >
          Technology Changes Everything
        </motion.h2>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground text-center mb-10"
          style={{ opacity: titleOpacity }}
        >
          Every era brings new ways to work together
        </motion.p>

        {/* Era cards with transitions */}
        <motion.div
          className="w-full flex justify-center"
          style={{ opacity: contentOpacity }}
        >
          <AnimatePresence mode="wait">
            <EraCard key={currentEra.id} era={currentEra} />
          </AnimatePresence>
        </motion.div>

        {/* Timeline indicator */}
        <motion.div style={{ opacity: contentOpacity }}>
          <TimelineIndicator currentIndex={currentEraIndex} total={ERAS.length} />
        </motion.div>

        {/* Connection text */}
        <motion.p
          className="text-center text-base md:text-lg text-muted-foreground mt-8 max-w-md"
          style={{ opacity: useTransform(progress, [0.5, 0.7], [0, 1]) }}
        >
          Now, AI makes it possible to match people, coordinate finances, and manage shared
          ownership like never before.
        </motion.p>
      </div>
    </div>
  );
}
