"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Loader2, Sparkles, X } from "lucide-react";
import { useHomiChat } from "@/hooks/useHomiChat";
import { useAnonymousContext } from "@/hooks/useAnonymousContext";
import { useTypewriter } from "@/hooks/useTypewriter";
import { ChatMarkdown } from "@/components/shared/ChatMarkdown";
import { cn } from "@/lib/utils";
import type { QuestionCategory } from "@/hooks/useAssessment";

const SECTION_PROMPTS: Record<QuestionCategory, string[]> = {
  motivation: [
    "Is co-ownership right for me?",
    "What are the real benefits of shared ownership?",
    "How is co-buying different from renting together?",
  ],
  people: [
    "Can family members co-own?",
    "What if my co-owner is someone I don't know well?",
    "Do I need a partner to start?",
  ],
  finances: [
    "How do we split unequal contributions?",
    "What credit score do I actually need?",
    "What if one person pays more of the down payment?",
  ],
  readiness: [
    "What's a TIC agreement?",
    "How is this different from joint tenancy?",
    "What happens if someone wants out?",
  ],
};

type Phase = "idle" | "focused";

interface HomiMiniInputProps {
  currentSection: QuestionCategory;
  className?: string;
}

export function HomiMiniInput({ currentSection, className }: HomiMiniInputProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [inputValue, setInputValue] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { onChatMessage, getContextForAPI } = useAnonymousContext();
  const { messages, isLoading, sendMessage, clearChat } = useHomiChat({
    userContext: getContextForAPI(),
    currentPage: "/assessment",
  });

  const [isPrefilled, setIsPrefilled] = useState(false);

  const prompts = SECTION_PROMPTS[currentSection];
  const { displayText, fullText } = useTypewriter({
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

  // Get the last assistant message
  const assistantMessage = messages.filter((m) => m.role === "assistant").pop();

  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    setSubmittedQuestion(trimmed);
    sendMessage(trimmed);
    onChatMessage();
    setInputValue("");
    setIsPrefilled(false);
    setShowPanel(true);
  }, [inputValue, isLoading, sendMessage, onChatMessage]);

  const handleDismissPanel = useCallback(() => {
    setShowPanel(false);
    setPhase("idle");
    setInputValue("");
    setIsPrefilled(false);
    setSubmittedQuestion("");
    clearChat();
  }, [clearChat]);

  // Escape key dismisses the panel
  useEffect(() => {
    if (!showPanel) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismissPanel();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showPanel, handleDismissPanel]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Backspace" && isPrefilled) {
      e.preventDefault();
      setInputValue("");
      setIsPrefilled(false);
    }
    if (e.key === "Escape") {
      if (phase === "focused" && !inputValue.trim()) {
        setPhase("idle");
      }
    }
  };

  return (
    <>
      <div className={cn("w-full max-w-lg mx-auto", className)}>
        <AnimatePresence mode="wait">
          {/* ---- IDLE: clickable prompt pill ---- */}
          {phase === "idle" && !showPanel && (
            <motion.button
              key="idle"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                setInputValue(fullText);
                setIsPrefilled(true);
                setPhase("focused");
              }}
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

          {/* ---- FOCUSED: text input (hidden once panel is showing) ---- */}
          {phase === "focused" && !showPanel && (
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
                  onChange={(e) => {
                    if (isPrefilled) {
                      setIsPrefilled(false);
                      const typed = e.target.value.slice(inputValue.length);
                      setInputValue(typed);
                    } else {
                      setInputValue(e.target.value);
                    }
                  }}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- BOTTOM SHEET PANEL ---- */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[65] bg-black/40 backdrop-blur-sm"
              onClick={handleDismissPanel}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 400,
              }}
              className="fixed bottom-0 inset-x-0 z-[65] max-h-[60vh] md:max-w-[50vw] md:mx-auto md:rounded-t-3xl flex flex-col rounded-t-2xl bg-[hsl(220,15%,13%)] border-t border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-white/90">Homi</span>
                </div>
                <button
                  onClick={handleDismissPanel}
                  className="h-8 w-8 rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-white/60" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {/* User question — right-aligned bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary/15 border border-primary/20 px-4 py-2.5">
                    <p className="text-sm text-white/80">{submittedQuestion}</p>
                  </div>
                </div>

                {/* Loading state */}
                {isLoading && !assistantMessage && (
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                    <div className="bg-white/[0.05] rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="h-2 w-2 rounded-full bg-white/30"
                            animate={{ y: [0, -6, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.15,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Homi response — left-aligned with avatar */}
                {assistantMessage && (
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 bg-white/[0.05] rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="text-sm leading-relaxed text-white/85">
                        <ChatMarkdown content={assistantMessage.content} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
