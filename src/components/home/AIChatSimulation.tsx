"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Objection Q&A data with short answers for simulation
const objections = [
  {
    id: "disagree",
    question: "What if we disagree?",
    shortAnswer: "Your TIC agreement defines how decisions get made—before tensions arise. Major choices need consensus; daily ones follow rules you set together.",
  },
  {
    id: "cant-pay",
    question: "What if someone can't pay?",
    shortAnswer: "Your agreement includes grace periods, remedies, and buyout terms upfront. Life happens—we help you plan for it.",
  },
  {
    id: "split-fairly",
    question: "How do we split things fairly?",
    shortAnswer: "Equity splits reflect your actual contributions—down payments, monthly payments, sweat equity. Your agreement captures what 'fair' means to your group.",
  },
  {
    id: "wants-to-sell",
    question: "What if one of us wants to sell?",
    shortAnswer: "Built-in exit procedures: rights of first refusal, notice periods, valuation methods. No surprises, no drama.",
  },
  {
    id: "legal",
    question: "Is this even legal?",
    shortAnswer: "Absolutely. Tenancy-in-common has been a recognized ownership structure for centuries. We help you do it right.",
  },
  {
    id: "credit",
    question: "What about my credit?",
    shortAnswer: "Everyone's credit matters when applying together. We help you understand requirements early and connect you with experienced lenders.",
  },
];

// Homi Avatar with glow effect
function HomiAvatar({ isTyping }: { isTyping: boolean }) {
  return (
    <div className="relative">
      <motion.div
        className={cn(
          "w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary flex items-center justify-center",
          "shadow-lg"
        )}
        animate={{
          boxShadow: isTyping
            ? [
                "0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)",
                "0 0 30px hsl(var(--primary) / 0.6), 0 0 60px hsl(var(--primary) / 0.3)",
                "0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)",
              ]
            : "0 0 15px hsl(var(--primary) / 0.3), 0 0 30px hsl(var(--primary) / 0.15)",
        }}
        transition={{
          duration: 1.5,
          repeat: isTyping ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
      </motion.div>
      {/* Subtle ring pulse when typing */}
      {isTyping && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </div>
  );
}

// Typing indicator with bouncing dots
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary/60"
          animate={{
            y: [0, -6, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// User question bubble (right-aligned)
function UserBubble({
  text,
  onClick,
  isActive,
}: {
  text: string;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "ml-auto max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl rounded-br-md",
        "bg-primary text-primary-foreground text-left",
        "hover:bg-primary/90 transition-colors cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
        isActive && "ring-2 ring-primary/30 ring-offset-2"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-sm md:text-base font-medium">{text}</span>
    </motion.button>
  );
}

// AI response bubble (left-aligned with glow)
function AIBubble({
  text,
  onClick,
  isTyping,
}: {
  text: string;
  onClick: () => void;
  isTyping: boolean;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  // Typing animation - reveal text word by word
  useEffect(() => {
    if (isTyping) {
      setDisplayedText("");
      setIsComplete(false);
      const words = text.split(" ");
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex < words.length) {
          setDisplayedText(words.slice(0, currentIndex + 1).join(" "));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, 150); // 150ms per word for smoother streaming

      return () => clearInterval(interval);
    } else {
      setDisplayedText(text);
      setIsComplete(true);
    }
  }, [text, isTyping]);

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative mr-auto max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl rounded-bl-md",
        "bg-card text-foreground text-left",
        "hover:bg-card/80 transition-colors cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
        "border border-transparent"
      )}
      style={{
        background: "linear-gradient(hsl(var(--card)), hsl(var(--card))) padding-box, linear-gradient(135deg, hsl(var(--primary) / 0.5), hsl(var(--accent) / 0.5)) border-box",
        borderWidth: "2px",
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        boxShadow: isComplete
          ? "0 0 15px hsl(var(--primary) / 0.15)"
          : "0 0 25px hsl(var(--primary) / 0.3)",
      }}
    >
      <span className="text-sm md:text-base leading-relaxed">
        {displayedText}
        {!isComplete && (
          <motion.span
            className="inline-block w-0.5 h-4 bg-primary ml-1 align-middle"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </span>
    </motion.button>
  );
}

// Progress dots
function ProgressDots({
  total,
  current,
  onDotClick,
}: {
  total: number;
  current: number;
  onDotClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            i === current
              ? "bg-primary w-6"
              : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
          )}
          aria-label={`Go to question ${i + 1}`}
        />
      ))}
    </div>
  );
}

interface AIChatSimulationProps {
  onOpenChat: (message: string) => void;
}

export function AIChatSimulation({ onOpenChat }: AIChatSimulationProps) {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.2 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"question" | "typing" | "answer" | "hold">("question");
  const [isPaused, setIsPaused] = useState(false);

  const currentObjection = objections[currentIndex];

  // Auto-play sequence
  useEffect(() => {
    if (!isInView || isPaused) return;

    let timeout: NodeJS.Timeout;

    switch (phase) {
      case "question":
        // Show question, then start typing
        timeout = setTimeout(() => setPhase("typing"), 800);
        break;
      case "typing":
        // Show typing indicator, then show answer
        timeout = setTimeout(() => setPhase("answer"), 600);
        break;
      case "answer":
        // After answer is typed out, hold
        const answerDuration = currentObjection.shortAnswer.split(" ").length * 150 + 500;
        timeout = setTimeout(() => setPhase("hold"), answerDuration);
        break;
      case "hold":
        // Hold, then move to next question
        timeout = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % objections.length);
          setPhase("question");
        }, 3000);
        break;
    }

    return () => clearTimeout(timeout);
  }, [isInView, isPaused, phase, currentIndex, currentObjection.shortAnswer]);

  const handleBubbleClick = useCallback(
    (question: string) => {
      setIsPaused(true);
      onOpenChat(question);
      // Resume after 30 seconds
      setTimeout(() => setIsPaused(false), 30000);
    },
    [onOpenChat]
  );

  const handleDotClick = useCallback((index: number) => {
    setIsPaused(true);
    setCurrentIndex(index);
    setPhase("question");
    // Resume after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  }, []);

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl mb-3">
            Every question you have, Homi&apos;s already answered
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Click any message to chat with Homi directly
          </p>
        </motion.div>

        {/* Chat simulation container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-background rounded-2xl border border-border p-4 md:p-6 min-h-[300px] md:min-h-[350px]">
            {/* Homi avatar header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <HomiAvatar isTyping={phase === "typing"} />
              <div>
                <p className="font-semibold text-foreground">Homi</p>
                <p className="text-xs text-muted-foreground">Your AI co-ownership guide</p>
              </div>
            </div>

            {/* Chat messages */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {/* User question */}
                <motion.div
                  key={`q-${currentIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-end"
                >
                  <UserBubble
                    text={currentObjection.question}
                    onClick={() => handleBubbleClick(currentObjection.question)}
                    isActive={phase === "question"}
                  />
                </motion.div>

                {/* AI response or typing indicator */}
                {(phase === "typing" || phase === "answer" || phase === "hold") && (
                  <motion.div
                    key={`a-${currentIndex}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-start"
                  >
                    {phase === "typing" ? (
                      <div className="bg-card rounded-2xl rounded-bl-md border border-border">
                        <TypingIndicator />
                      </div>
                    ) : (
                      <AIBubble
                        text={currentObjection.shortAnswer}
                        onClick={() => handleBubbleClick(currentObjection.question)}
                        isTyping={phase === "answer"}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Progress dots */}
          <ProgressDots
            total={objections.length}
            current={currentIndex}
            onDotClick={handleDotClick}
          />

          {/* Hint text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-4"
          >
            Tap any bubble to ask Homi your own questions
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
