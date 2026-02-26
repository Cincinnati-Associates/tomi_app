"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, Loader2, Sparkles } from "lucide-react";
import { Drawer as DrawerPrimitive } from "vaul";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useHomiChat } from "@/hooks/useHomiChat";
import { useAnonymousContext } from "@/hooks/useAnonymousContext";
import { ChatMarkdown } from "./ChatMarkdown";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface CompactHomiChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  suggestedPrompts?: { label: string }[];
  placeholder?: string;
  contextLabel?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Sub-components (internal)
// ---------------------------------------------------------------------------

export function CompactChatHeader({
  contextLabel,
  onClose,
}: {
  contextLabel?: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">Homi</span>
        {contextLabel && (
          <span className="text-xs text-muted-foreground">{contextLabel}</span>
        )}
      </div>
      <button
        onClick={onClose}
        className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
        aria-label="Close chat"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}

export function CompactChatMessages({
  messages,
  isLoading,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);

  // Auto-scroll within the chat container (not the page) on new messages
  useEffect(() => {
    if (!userHasScrolled && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, userHasScrolled]);

  // Reset scroll lock when user sends a new message
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1]?.role === "user") {
      setUserHasScrolled(false);
    }
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    setUserHasScrolled(!isAtBottom);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-3 py-2 overscroll-contain"
    >
      <div className="space-y-2">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {message.role === "assistant" ? (
              <div className="flex gap-2 max-w-[95%]">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-md px-3 py-2 text-sm leading-relaxed text-foreground">
                  <ChatMarkdown content={message.content} />
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3 py-2 text-sm">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isLoading &&
          (messages.length === 0 ||
            messages[messages.length - 1]?.role === "user") && (
            <div className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-md px-3 py-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
                      animate={{ y: [0, -4, 0] }}
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

        <div ref={endRef} />
      </div>
    </div>
  );
}

export function CompactChatInput({
  inputValue,
  setInputValue,
  onSubmit,
  isLoading,
  placeholder,
}: {
  inputValue: string;
  setInputValue: (v: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="border-t border-border p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex-shrink-0">
      <div className="flex items-end gap-2 bg-muted rounded-xl p-1.5 pl-3">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ask Homi..."}
          className="flex-1 resize-none bg-transparent text-sm focus:outline-none min-h-[36px] max-h-[80px] py-1.5 text-foreground placeholder:text-muted-foreground"
          style={{ fontSize: "16px" }} // Prevents iOS zoom
          rows={1}
          disabled={isLoading}
        />
        <motion.button
          type="button"
          disabled={!inputValue.trim() || isLoading}
          onClick={onSubmit}
          className="h-8 w-8 rounded-lg bg-primary text-white disabled:opacity-50 flex items-center justify-center flex-shrink-0"
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </motion.button>
      </div>
    </div>
  );
}

function CompactEmptyState({
  prompts,
  onSelect,
}: {
  prompts: { label: string }[];
  onSelect: (label: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-3 py-4 text-center">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Ask me anything about this question
      </p>
      <div className="flex flex-col gap-2 w-full max-w-[280px]">
        {prompts.slice(0, 2).map((prompt) => (
          <button
            key={prompt.label}
            onClick={() => onSelect(prompt.label)}
            className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm text-left border border-border transition-colors"
          >
            {prompt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CompactHomiChat({
  isOpen,
  onClose,
  initialMessage,
  suggestedPrompts,
  placeholder,
  contextLabel,
  className,
}: CompactHomiChatProps) {
  const isMobile = useIsMobile();
  const { onChatMessage, getContextForAPI } = useAnonymousContext();
  const { messages, isLoading, sendMessage } = useHomiChat({
    userContext: getContextForAPI(),
  });
  const [inputValue, setInputValue] = useState("");
  const hasInitialized = useRef(false);

  // Send initial message once when first opened (if chat is empty)
  useEffect(() => {
    if (isOpen && initialMessage && !hasInitialized.current && messages.length === 0) {
      hasInitialized.current = true;
      sendMessage(initialMessage);
    }
  }, [isOpen, initialMessage, sendMessage, messages.length]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue.trim());
      onChatMessage();
      setInputValue("");
    }
  };

  const handleSuggestedPrompt = (label: string) => {
    sendMessage(label);
    onChatMessage();
  };

  const defaultPrompts = suggestedPrompts ?? [
    { label: "Explain this in simple terms" },
    { label: "Why does this matter?" },
  ];

  // Shared inner content
  const chatContent = (
    <>
      <CompactChatHeader contextLabel={contextLabel} onClose={onClose} />
      {messages.length === 0 && !isLoading ? (
        <CompactEmptyState
          prompts={defaultPrompts}
          onSelect={handleSuggestedPrompt}
        />
      ) : (
        <CompactChatMessages messages={messages} isLoading={isLoading} />
      )}
      <CompactChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder={placeholder}
      />
    </>
  );

  // ----- Mobile: Vaul drawer -----
  if (isMobile) {
    return (
      <DrawerPrimitive.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        snapPoints={[0.45, 0.72]}
        activeSnapPoint={isOpen ? 0.45 : undefined}
        fadeFromIndex={1}
        modal={false}
        shouldScaleBackground={false}
        dismissible
      >
        <DrawerPrimitive.Portal>
          <DrawerPrimitive.Overlay className="fixed inset-0 z-40 bg-black/20" />
          <DrawerPrimitive.Content
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-border bg-background shadow-lg outline-none"
          >
            {/* Drag handle */}
            <DrawerPrimitive.Handle className="mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-muted-foreground/30" />
            {/* Title for accessibility (visually hidden) */}
            <DrawerPrimitive.Title className="sr-only">
              Chat with Homi
            </DrawerPrimitive.Title>
            {chatContent}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Portal>
      </DrawerPrimitive.Root>
    );
  }

  // ----- Desktop: inline expand -----
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-background shadow-sm",
            className,
          )}
        >
          <div className="flex flex-col max-h-[350px]">
            {chatContent}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
