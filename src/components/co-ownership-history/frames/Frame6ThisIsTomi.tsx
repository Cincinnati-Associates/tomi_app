"use client";

import { motion, useTransform, MotionValue } from "framer-motion";
import { Sparkles, Heart, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

interface Frame6ThisIsTomiProps {
  progress: MotionValue<number>;
}

const VALUE_PROPS = [
  {
    id: "ai",
    icon: Sparkles,
    title: "AI handles the hard parts",
    description: "From matching to legal docs, we automate the complexity",
  },
  {
    id: "partner",
    icon: Heart,
    title: "We're your partner, not your vendor",
    description: "We succeed when you succeed. It's that simple.",
  },
  {
    id: "simple",
    icon: Handshake,
    title: "Co-ownership, finally made simple",
    description: "Clear agreements, fair terms, real support",
  },
];

function TomiLogo({ progress }: { progress: MotionValue<number> }) {
  // Animate the character drawing
  const strokeProgress = useTransform(progress, [0, 0.4], [0, 1]);

  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8">
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Logo container */}
      <motion.div
        className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Tomi character animation */}
        <svg
          viewBox="0 0 100 100"
          className="w-20 h-20 md:w-24 md:h-24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.text
            x="50"
            y="65"
            textAnchor="middle"
            className="fill-primary-foreground font-bold"
            style={{
              fontSize: "50px",
              opacity: strokeProgress,
            }}
          >
            富
          </motion.text>
        </svg>
      </motion.div>
    </div>
  );
}

function ValuePropCard({
  prop,
  index,
  progress,
}: {
  prop: (typeof VALUE_PROPS)[0];
  index: number;
  progress: MotionValue<number>;
}) {
  const Icon = prop.icon;

  // Stagger the animations
  const startPoint = 0.3 + index * 0.15;
  const endPoint = startPoint + 0.2;

  const opacity = useTransform(progress, [startPoint, endPoint], [0, 1]);
  const y = useTransform(progress, [startPoint, endPoint], [30, 0]);

  return (
    <motion.div
      className="flex flex-col items-center text-center p-4 md:p-6"
      style={{ opacity, y }}
    >
      <div
        className={cn(
          "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4",
          "bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20"
        )}
      >
        <Icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
      </div>
      <h3 className="font-heading text-lg md:text-xl font-semibold text-foreground mb-2">
        {prop.title}
      </h3>
      <p className="text-sm md:text-base text-muted-foreground max-w-xs">
        {prop.description}
      </p>
    </motion.div>
  );
}

function PeopleIllustration({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.6, 0.8], [0, 1]);
  const scale = useTransform(progress, [0.6, 0.8], [0.9, 1]);

  return (
    <motion.div
      className="relative w-full max-w-md aspect-[3/2] mx-auto mt-8"
      style={{ opacity, scale }}
    >
      <svg
        viewBox="0 0 400 250"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background house shape */}
        <motion.path
          d="M200 40 L50 120 L50 230 L350 230 L350 120 L200 40"
          className="stroke-primary/30"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        {/* Roof */}
        <motion.path
          d="M200 40 L50 120 L350 120 Z"
          className="fill-primary/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        />

        {/* People silhouettes - simplified and warm */}
        <g className="fill-primary/40">
          {/* Person 1 */}
          <motion.circle
            cx="120"
            cy="160"
            r="18"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
          />
          <motion.path
            d="M120 180 L120 220 M105 195 L135 195"
            className="stroke-primary/40"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.3 }}
          />

          {/* Person 2 */}
          <motion.circle
            cx="200"
            cy="150"
            r="20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.4, type: "spring" }}
          />
          <motion.path
            d="M200 172 L200 220 M180 190 L220 190"
            className="stroke-primary/40"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.5 }}
          />

          {/* Person 3 */}
          <motion.circle
            cx="280"
            cy="160"
            r="18"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.6, type: "spring" }}
          />
          <motion.path
            d="M280 180 L280 220 M265 195 L295 195"
            className="stroke-primary/40"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.7 }}
          />
        </g>

        {/* Connection lines between people */}
        <motion.path
          d="M138 170 Q200 140 182 170"
          className="stroke-primary/20"
          strokeWidth="2"
          strokeDasharray="4,4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.8 }}
        />
        <motion.path
          d="M218 170 Q250 145 262 170"
          className="stroke-primary/20"
          strokeWidth="2"
          strokeDasharray="4,4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.9 }}
        />
      </svg>
    </motion.div>
  );
}

export function Frame6ThisIsTomi({ progress }: Frame6ThisIsTomiProps) {
  const titleOpacity = useTransform(progress, [0, 0.15], [0, 1]);
  const textOpacity = useTransform(progress, [0.8, 1], [0, 1]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 md:px-12 overflow-y-auto">
      <div className="max-w-4xl w-full py-8">
        {/* Logo */}
        <TomiLogo progress={progress} />

        {/* Title */}
        <motion.div className="text-center mb-10" style={{ opacity: titleOpacity }}>
          <h2 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            This Is Tomi
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            Tomi exists to help you create the life you want, with the people you want in it.
          </p>
        </motion.div>

        {/* Value props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8">
          {VALUE_PROPS.map((prop, index) => (
            <ValuePropCard key={prop.id} prop={prop} index={index} progress={progress} />
          ))}
        </div>

        {/* People illustration */}
        <PeopleIllustration progress={progress} />

        {/* Closing text */}
        <motion.p
          className="text-center text-lg md:text-xl text-foreground font-medium mt-8"
          style={{ opacity: textOpacity }}
        >
          Together, we make homeownership possible again.
        </motion.p>
      </div>
    </div>
  );
}
