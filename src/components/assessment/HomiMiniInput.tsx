"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { Drawer as DrawerPrimitive } from "vaul";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useHomiChat } from "@/hooks/useHomiChat";
import { useAnonymousContext } from "@/hooks/useAnonymousContext";
import {
  CompactChatHeader,
  CompactChatMessages,
  CompactChatInput,
} from "@/components/shared/CompactHomiChat";
import { cn } from "@/lib/utils";

interface HomiMiniInputProps {
  homiPrompt: string;
  contextLabel?: string;
  questionIndex: number;
  buildInitialMessage: () => string;
}

// ---------------------------------------------------------------------------
// Typewriter hook — cycles through prompts with type/erase animation
// ---------------------------------------------------------------------------

function useTypewriterPlaceholder(
  prompts: string[],
  active: boolean,
  questionIndex: number
) {
  const [displayed, setDisplayed] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const phaseRef = useRef<"typing" | "pausing" | "erasing">("typing");
  const charRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when question changes or prompts change
  useEffect(() => {
    setDisplayed("");
    setPromptIdx(0);
    phaseRef.current = "typing";
    charRef.current = 0;
  }, [questionIndex]);

  useEffect(() => {
    if (!active) return;

    const currentPrompt = prompts[promptIdx] || "";

    const clear = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    if (phaseRef.current === "typing") {
      intervalRef.current = setInterval(() => {
        charRef.current++;
        setDisplayed(currentPrompt.slice(0, charRef.current));
        if (charRef.current >= currentPrompt.length) {
          clear();
          phaseRef.current = "pausing";
          timeoutRef.current = setTimeout(() => {
            phaseRef.current = "erasing";
            // Trigger re-run
            setDisplayed((d) => d);
          }, 2000);
        }
      }, 50);
    } else if (phaseRef.current === "erasing") {
      intervalRef.current = setInterval(() => {
        charRef.current--;
        setDisplayed(currentPrompt.slice(0, charRef.current));
        if (charRef.current <= 0) {
          clear();
          phaseRef.current = "typing";
          charRef.current = 0;
          setPromptIdx((prev) => (prev + 1) % prompts.length);
        }
      }, 30);
    }

    return clear;
  }, [active, prompts, promptIdx, displayed, questionIndex]);

  return displayed;
}

// ---------------------------------------------------------------------------
// HomiMiniInput
// ---------------------------------------------------------------------------

export function HomiMiniInput({
  homiPrompt,
  contextLabel,
  questionIndex,
  buildInitialMessage,
}: HomiMiniInputProps) {
  const isMobile = useIsMobile();
  const { onChatMessage, getContextForAPI } = useAnonymousContext();
  const { messages, isLoading, sendMessage, clearChat } = useHomiChat({
    userContext: getContextForAPI(),
    currentPage: "/assessment",
  });

  const [phase, setPhase] = useState<"idle" | "focused" | "chatting">("idle");
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasSentContext = useRef(false);

  const prompts = [homiPrompt, "Ask Homi anything..."];
  const typewriterText = useTypewriterPlaceholder(
    prompts,
    phase === "idle",
    questionIndex
  );

  // Reset to idle when question changes
  useEffect(() => {
    setPhase("idle");
    setInputValue("");
    hasSentContext.current = false;
    clearChat();
  }, [questionIndex, clearChat]);

  const handleBlur = useCallback(() => {
    if (phase === "focused" && !inputValue.trim()) {
      setPhase("idle");
    }
  }, [phase, inputValue]);

  // Prepend assessment context to the first message so Homi knows
  // which question the user is on and what they've answered so far
  const sendWithContext = useCallback(
    (text: string) => {
      if (!hasSentContext.current) {
        hasSentContext.current = true;
        const context = buildInitialMessage();
        sendMessage(`${context}\n\nMy question: ${text}`);
      } else {
        sendMessage(text);
      }
    },
    [buildInitialMessage, sendMessage]
  );

  const handleSubmit = useCallback(() => {
    if (isLoading) return;
    // If user typed something, send that; otherwise send the sample prompt
    const text = inputValue.trim() || homiPrompt;
    sendWithContext(text);
    onChatMessage();
    setInputValue("");
    setPhase("chatting");
  }, [inputValue, isLoading, homiPrompt, sendWithContext, onChatMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleClose = useCallback(() => {
    setPhase("idle");
  }, []);

  // Chat input state for the chatting phase
  const [chatInputValue, setChatInputValue] = useState("");

  const handleChatSubmit = useCallback(() => {
    const text = chatInputValue.trim();
    if (!text || isLoading) return;
    sendMessage(text);
    onChatMessage();
    setChatInputValue("");
  }, [chatInputValue, isLoading, sendMessage, onChatMessage]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "chatting") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [phase, handleClose]);

  // ── Chatting state: full chat window ──────────────────────────────────

  const chatContent = (
    <>
      <CompactChatHeader contextLabel={contextLabel} onClose={handleClose} />
      <CompactChatMessages messages={messages} isLoading={isLoading} />
      <CompactChatInput
        inputValue={chatInputValue}
        setInputValue={setChatInputValue}
        onSubmit={handleChatSubmit}
        isLoading={isLoading}
        placeholder="Ask Homi..."
      />
    </>
  );

  const chattingOverlay = (() => {
    if (phase !== "chatting") return null;

    // Mobile: Vaul drawer
    if (isMobile) {
      return (
        <DrawerPrimitive.Root
          open
          onOpenChange={(open) => {
            if (!open) handleClose();
          }}
          snapPoints={[0.55, 0.8]}
          activeSnapPoint={0.55}
          fadeFromIndex={1}
          modal={false}
          shouldScaleBackground={false}
          dismissible
        >
          <DrawerPrimitive.Portal>
            <DrawerPrimitive.Overlay className="fixed inset-0 z-40 bg-black/20" />
            <DrawerPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-border bg-background shadow-lg outline-none">
              <DrawerPrimitive.Handle className="mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-muted-foreground/30" />
              <DrawerPrimitive.Title className="sr-only">
                Chat with Homi
              </DrawerPrimitive.Title>
              {chatContent}
            </DrawerPrimitive.Content>
          </DrawerPrimitive.Portal>
        </DrawerPrimitive.Root>
      );
    }

    // Desktop: centered overlay
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-full max-w-lg mx-4 max-h-[450px] rounded-2xl border border-border bg-background shadow-xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {chatContent}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  })();

  // ── Idle / Focused state: mini input bar ──────────────────────────────

  const isFocusedOrIdle = phase === "idle" || phase === "focused";

  return (
    <>
      {/* Mini input bar */}
      <AnimatePresence>
        {isFocusedOrIdle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm mx-auto"
          >
            <div
              className={cn(
                "flex items-center gap-2 bg-muted border border-border transition-all duration-200",
                phase === "idle"
                  ? "rounded-full px-3 py-1.5"
                  : "rounded-2xl px-4 py-2"
              )}
              onClick={() => {
                if (phase === "idle") {
                  setPhase("focused");
                  // Delay focus to next tick so the textarea is rendered
                  setTimeout(() => textareaRef.current?.focus(), 0);
                }
              }}
            >
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />

              <div className="flex-1 relative min-h-[28px] flex items-center">
                {phase === "idle" ? (
                  // Typewriter placeholder display
                  <span className="text-sm text-muted-foreground pointer-events-none select-none">
                    {typewriterText}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block ml-0.5 w-[2px] h-[14px] bg-muted-foreground/60 align-middle"
                    />
                  </span>
                ) : (
                  // Active textarea
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 80) + "px";
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder={homiPrompt}
                    className="flex-1 w-full resize-none bg-transparent text-sm focus:outline-none min-h-[28px] max-h-[80px] py-0.5 text-foreground placeholder:text-muted-foreground"
                    style={{ fontSize: "16px" }}
                    rows={1}
                    disabled={isLoading}
                  />
                )}
              </div>

              <motion.button
                type="button"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmit();
                }}
                className="h-7 w-7 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 flex items-center justify-center flex-shrink-0"
                whileTap={{ scale: 0.95 }}
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

      {/* Chat overlay */}
      {chattingOverlay}
    </>
  );
}
