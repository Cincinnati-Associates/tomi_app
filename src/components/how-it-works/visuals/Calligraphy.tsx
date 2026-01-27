"use client";

import { motion } from "framer-motion";

interface CalligraphyProps {
  props: {
    character: string;
    meaning: string;
    pronunciation?: string;
    showMeaning?: boolean;
  };
}

export function Calligraphy({ props }: CalligraphyProps) {
  const { character, meaning, pronunciation, showMeaning = true } = props;

  return (
    <div className="w-full max-w-sm mx-auto px-4 text-center">
      {/* Main character with brush stroke animation effect */}
      <motion.div
        className="relative inline-block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 blur-3xl bg-primary/20 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        />

        {/* Character */}
        <motion.div
          className="relative font-serif text-8xl md:text-9xl text-foreground"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            type: "spring",
            stiffness: 100,
          }}
        >
          {/* Brush stroke reveal effect using clip-path */}
          <motion.span
            className="block"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
          >
            {character}
          </motion.span>
        </motion.div>

        {/* Ink splash decoration */}
        <motion.div
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5, type: "spring" }}
        />
      </motion.div>

      {/* Pronunciation */}
      {pronunciation && (
        <motion.p
          className="mt-6 text-lg text-primary font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          &ldquo;{pronunciation}&rdquo;
        </motion.p>
      )}

      {/* Meaning */}
      {showMeaning && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <p className="text-2xl font-heading font-semibold text-foreground">
            {meaning}
          </p>
        </motion.div>
      )}

      {/* Decorative line */}
      <motion.div
        className="mt-6 mx-auto w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      />
    </div>
  );
}
