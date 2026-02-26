"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Loader2, Sparkles, ChevronLeft } from "lucide-react";
import { useHomiChat } from "@/hooks/useHomiChat";
import { useAnonymousContext } from "@/hooks/useAnonymousContext";
import { useTypewriter } from "@/hooks/useTypewriter";
import { ChatMarkdown } from "@/components/shared/ChatMarkdown";
import { cn } from "@/lib/utils";
import type { QuestionCategory } from "@/hooks/useAssessment";

const SECTION_PROMPTS: Record<QuestionCategory, string[]> = {
  the_why: [
    "Is co-ownership right for me?",
    "How is co-buying different from renting together?",
    "What are the real benefits of shared ownership?",
  ],
  the_who: [
    "Do I need a partner to start?",
    "Can family members co-own?",
    "What if my co-owner is someone I don't know well?",
  ],
  the_what: [
    "What types of homes work best for co-ownership?",
    "Can I co-own in multiple cities?",
    "What if our lifestyles are different?",
  ],
  the_money: [
    "How do we split unequal contributions?",
    "What credit score do I actually need?",
    "What if one person pays more of the down payment?",
  ],
  the_readiness: [
    "What's a TIC agreement?",
    "How is this different from joint tenancy?",
    "What happens if someone wants out?",
  ],
};

type Phase = "idle" | "focused" | "responded";

interface HomiMiniInputProps {
  currentSection: QuestionCategory;
  className?: string;
}

export function HomiMiniInput({ currentSection, className }: HomiMiniInputProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [inputValue, setInputValue] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { onChatMessage, getContextForAPI } = useAnonymousContext();
  const { messages, isLoading, sendMessage, clearChat } = useHomiChat({
    userContext: getContextForAPI(),
  });

  const prompts = SECTION_PROMPTS[currentSection];
  const { displayText } = useTypewriter({
    texts: prompts,
    typeSpeed: 40,
    deleteSpeed: 25,
    pauseAfterType: 3000,
    pauseAfterDelete: 300,
    loop: true,
  });

  // Focus input when entering focused phase
  useEffect(() => {
    if (phase === "focused") {
      inputRef.current?.focus();
    }
  }, [phase]);

  // Detect when assistant response arrives
  useEffect(() => {
    if (
      phase === "focused" &&
      messages.length > 0 &&
      messages[messages.length - 1]?.role === "assistant"
    ) {
      setPhase("responded");
    }
  }, [phase, messages]);

  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    setSubmittedQuestion(trimmed);
    sendMessage(trimmed);
    onChatMessage();
    setInputValue("");
  }, [inputValue, isLoading, sendMessage, onChatMessage]);

  const handleDismiss = useCallback(() => {
    setPhase("idle");
    setInputValue("");
    setSubmittedQuestion("");
    clearChat();
  }, [clearChat]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      if (phase === "focused" && !inputValue.trim()) {
        setPhase("idle");
      }
    }
  };

  // Get the last assistant message
  const assistantMessage = messages.filter((m) => m.role === "assistant").pop();

  return (
    <div className={cn("w-full max-w-lg mx-auto", className)}>
      <AnimatePresence mode="wait">
        {/* ---- IDLE: clickable prompt pill ---- */}
        {phase === "idle" && (
          <motion.button
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            onClick={() => setPhase("focused")}
            className={cn(
              "w-full flex items-center gap-2.5",
              "px-4 py-2.5 rounded-full",
              "bg-card/80 backdrop-blur-sm border border-border/60",
              "hover:border-primary/40 hover:bg-card",
              "transition-colors duration-200",
              "text-left cursor-text"
            )}
          >
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground truncate">
              {displayText}
              <span className="animate-blink">|</span>
            </span>
          </motion.button>
        )}

        {/* ---- FOCUSED: text input ---- */}
        {phase === "focused" && !assistantMessage && (
          <motion.div
            key="focused"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="w-full"
          >
            <div
              className={cn(
                "flex items-center gap-2",
                "px-4 py-2 rounded-full",
                "bg-card/90 backdrop-blur-sm border border-primary/40",
                "ring-2 ring-primary/20"
              )}
            >
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Homi..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                style={{ fontSize: "16px" }}
                disabled={isLoading}
              />
              <motion.button
                type="button"
                disabled={!inputValue.trim() || isLoading}
                onClick={handleSubmit}
                className="h-7 w-7 rounded-full bg-primary text-primary-foreground disabled:opacity-40 flex items-center justify-center flex-shrink-0"
                whileTap={{ scale: 0.9 }}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowUp className="h-3.5 w-3.5" />
                )}
              </motion.button>
            </div>

            {/* Loading state after submit */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 px-4"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Homi is thinking...</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ---- RESPONDED: show answer inline ---- */}
        {phase === "responded" && assistantMessage && (
          <motion.div
            key="responded"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full space-y-2"
          >
            {/* User question */}
            <div className="flex items-start gap-2 px-1">
              <span className="text-xs text-muted-foreground leading-relaxed">
                You asked: <span className="text-foreground/70">{submittedQuestion}</span>
              </span>
            </div>

            {/* Homi response */}
            <div className="bg-card/80 backdrop-blur-sm border border-border/60 rounded-xl px-4 py-3">
              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1 text-sm leading-relaxed text-foreground/90 max-h-[150px] overflow-y-auto scrollbar-hide">
                  <ChatMarkdown content={assistantMessage.content} />
                </div>
              </div>
            </div>

            {/* Dismiss button */}
            <div className="flex justify-center">
              <button
                onClick={handleDismiss}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-3"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back to assessment
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
