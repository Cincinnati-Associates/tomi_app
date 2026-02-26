"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useTransform, MotionValue, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Culture {
  id: string;
  country: string;
  term: string;
  termNative?: string;
  description: string;
  x: number; // percentage position on map
  y: number;
}

const CULTURES: Culture[] = [
  {
    id: "japan",
    country: "Japan",
    term: "Ie",
    termNative: "家",
    description: "Multi-generational family estates passed through generations, where family members pool resources and live together.",
    x: 85,
    y: 35,
  },
  {
    id: "kenya",
    country: "Kenya",
    term: "Chamas",
    description: "Community investment circles where members pool savings to help each purchase property in rotation.",
    x: 55,
    y: 55,
  },
  {
    id: "mexico",
    country: "Mexico",
    term: "Tandas",
    description: "Rotating savings groups where participants collectively save and take turns receiving funds for property purchases.",
    x: 18,
    y: 42,
  },
  {
    id: "israel",
    country: "Israel",
    term: "Kibbutzim",
    description: "Collective communities where land and resources are shared, and major decisions are made together.",
    x: 56,
    y: 38,
  },
  {
    id: "denmark",
    country: "Denmark",
    term: "Bofaellesskab",
    description: "Modern co-housing cooperatives with private homes and shared common spaces, designed for community living.",
    x: 50,
    y: 25,
  },
];

interface Frame2WorldKnowsProps {
  progress: MotionValue<number>;
  isActive: boolean;
}

function InteractiveGlobe({
  activeCulture,
  onCultureClick,
  isPaused,
}: {
  activeCulture: Culture;
  onCultureClick: (culture: Culture) => void;
  isPaused: boolean;
}) {
  return (
    <div className="relative w-full max-w-2xl aspect-[2/1] mx-auto">
      {/* Globe/Map SVG */}
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient definitions */}
        <defs>
          <radialGradient id="globeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--secondary))" />
            <stop offset="100%" stopColor="hsl(var(--muted))" />
          </radialGradient>
        </defs>

        {/* Ocean background */}
        <rect
          x="0"
          y="0"
          width="1000"
          height="500"
          fill="url(#globeGradient)"
          rx="20"
        />

        {/* Simplified world continents */}
        {/* North America */}
        <path
          d="M80 80 Q120 60 200 70 L220 90 Q240 130 220 180 L180 200 Q140 210 100 190 L80 150 Q60 110 80 80 Z"
          className="fill-muted-foreground/20 dark:fill-muted-foreground/30"
        />
        {/* South America */}
        <path
          d="M180 230 Q220 220 240 240 L260 300 Q270 360 240 400 L200 420 Q160 400 170 340 L180 230 Z"
          className="fill-muted-foreground/20 dark:fill-muted-foreground/30"
        />
        {/* Europe */}
        <path
          d="M440 60 Q480 50 540 60 L560 80 Q580 120 560 160 L520 180 Q480 170 450 140 L440 100 Q430 80 440 60 Z"
          className="fill-muted-foreground/20 dark:fill-muted-foreground/30"
        />
        {/* Africa */}
        <path
          d="M450 190 Q500 170 560 180 L600 240 Q620 320 580 380 L520 420 Q460 400 440 340 L430 260 Q440 210 450 190 Z"
          className="fill-muted-foreground/20 dark:fill-muted-foreground/30"
        />
        {/* Asia */}
        <path
          d="M560 50 Q650 30 780 50 L860 100 Q900 160 880 220 L820 260 Q740 280 660 250 L600 200 Q560 140 560 100 L560 50 Z"
          className="fill-muted-foreground/20 dark:fill-muted-foreground/30"
        />
        {/* Australia */}
        <path
          d="M780 320 Q840 300 900 320 L920 360 Q930 400 900 420 L840 430 Q790 420 780 380 L780 320 Z"
          className="fill-muted-foreground/20 dark:fill-muted-foreground/30"
        />

        {/* Grid lines */}
        {[100, 200, 300, 400].map((y) => (
          <line
            key={`h-${y}`}
            x1="0"
            y1={y}
            x2="1000"
            y2={y}
            className="stroke-muted-foreground/10"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        ))}
        {[200, 400, 600, 800].map((x) => (
          <line
            key={`v-${x}`}
            x1={x}
            y1="0"
            x2={x}
            y2="500"
            className="stroke-muted-foreground/10"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        ))}
      </svg>

      {/* Culture markers */}
      {CULTURES.map((culture) => {
        const isActive = culture.id === activeCulture.id;

        return (
          <button
            key={culture.id}
            onClick={() => onCultureClick(culture)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: `${culture.x}%`,
              top: `${culture.y}%`,
            }}
            aria-label={`Learn about ${culture.term} in ${culture.country}`}
          >
            {/* Pulse ring */}
            <motion.div
              className={cn(
                "absolute inset-0 rounded-full",
                isActive ? "bg-primary/30" : "bg-primary/20"
              )}
              animate={
                isActive
                  ? {
                      scale: [1, 2.5, 1],
                      opacity: [0.6, 0, 0.6],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ width: 32, height: 32, margin: -8 }}
            />

            {/* Marker dot */}
            <motion.div
              className={cn(
                "relative w-4 h-4 rounded-full shadow-lg transition-all duration-300",
                isActive
                  ? "bg-primary scale-150"
                  : "bg-primary/70 group-hover:bg-primary group-hover:scale-125"
              )}
              animate={isActive ? { scale: [1.5, 1.8, 1.5] } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Country label */}
            <motion.div
              className={cn(
                "absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap transition-opacity",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <span className="text-xs font-medium bg-card px-2 py-1 rounded-full border border-border shadow-sm">
                {culture.country}
              </span>
            </motion.div>
          </button>
        );
      })}

      {/* Pause indicator */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded"
          >
            Click anywhere to resume
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CultureCard({ culture }: { culture: Culture }) {
  return (
    <motion.div
      key={culture.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="text-center max-w-md mx-auto"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="text-2xl md:text-3xl font-heading font-bold text-primary">
          {culture.term}
        </span>
        {culture.termNative && (
          <span className="text-3xl md:text-4xl text-muted-foreground">
            {culture.termNative}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-2">{culture.country}</p>
      <p className="text-base md:text-lg text-foreground leading-relaxed">
        {culture.description}
      </p>
    </motion.div>
  );
}

export function Frame2WorldKnows({ progress, isActive }: Frame2WorldKnowsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeCulture = CULTURES[currentIndex];

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CULTURES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const handleCultureClick = useCallback((culture: Culture) => {
    const index = CULTURES.findIndex((c) => c.id === culture.id);
    setCurrentIndex(index);
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const titleOpacity = useTransform(progress, [0, 0.15], [0, 1]);
  const contentOpacity = useTransform(progress, [0.1, 0.3], [0, 1]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center px-6 md:px-12"
      onClick={isPaused ? handleResume : undefined}
    >
      <div className="max-w-5xl w-full">
        {/* Title */}
        <motion.div className="text-center mb-4 md:mb-6" style={{ opacity: titleOpacity }}>
          <h2 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            The World Knows Something We Forgot
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Across the world, people never stopped living this way...
          </p>
        </motion.div>

        {/* Globe */}
        <motion.div className="mb-4 md:mb-6" style={{ opacity: contentOpacity }}>
          <InteractiveGlobe
            activeCulture={activeCulture}
            onCultureClick={handleCultureClick}
            isPaused={isPaused}
          />
        </motion.div>

        {/* Culture info card */}
        <motion.div style={{ opacity: contentOpacity }}>
          <AnimatePresence mode="wait">
            <CultureCard culture={activeCulture} />
          </AnimatePresence>
        </motion.div>

        {/* Culture dots navigation */}
        <motion.div
          className="flex justify-center gap-2 mt-6"
          style={{ opacity: contentOpacity }}
        >
          {CULTURES.map((culture, index) => (
            <button
              key={culture.id}
              onClick={() => handleCultureClick(culture)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`View ${culture.country}`}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
