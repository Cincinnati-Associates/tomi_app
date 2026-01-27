"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, Loader2, Sparkles, HelpCircle, TrendingUp, User, Calculator } from "lucide-react";
import { useHomiChat } from "@/hooks/useHomiChat";
import { useAnonymousContext } from "@/hooks/useAnonymousContext";
import { ChatMarkdown } from "./ChatMarkdown";

interface HomiChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

const SUGGESTED_PROMPTS = [
  { label: "How does co-ownership work?", icon: HelpCircle },
  { label: "What are the benefits?", icon: TrendingUp },
  { label: "Is this right for me?", icon: User },
  { label: "See my buying power", icon: Calculator },
];

export function HomiChat({ isOpen, onClose, initialMessage }: HomiChatProps) {
  // Anonymous user context for personalization
  const { onChatMessage, getContextForAPI } = useAnonymousContext();

  // Pass user context to the chat hook
  const { messages, isLoading, sendMessage, clearChat } = useHomiChat({
    userContext: getContextForAPI(),
  });
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef(false);

  // Handle initial message
  useEffect(() => {
    if (isOpen && initialMessage && !hasInitialized.current && messages.length === 0) {
      hasInitialized.current = true;
      sendMessage(initialMessage);
    }
  }, [isOpen, initialMessage, sendMessage, messages.length]);

  // Reset initialization flag when closed
  useEffect(() => {
    if (!isOpen) {
      hasInitialized.current = false;
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleClose is stable and doesn't need to be in deps
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      onChatMessage(); // Track chat message count
      setInputValue("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClose = () => {
    onClose();
    // Clear chat when closed to start fresh next time
    setTimeout(() => clearChat(), 300);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt);
    onChatMessage(); // Track chat message count
  };

  // Modal content shared between mobile and desktop
  const modalContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Avatar with gradient + status */}
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">Homi</h2>
            <p className="text-xs text-muted-foreground">Your co-ownership guide</p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          aria-label="Close chat"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Empty state with suggested prompts */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>

            <h3 className="font-heading font-semibold text-xl mb-2 text-foreground">
              Hi, I&apos;m Homi!
            </h3>
            <p className="text-muted-foreground mb-8 max-w-[280px]">
              Ask me anything about co-ownership, or try one of these:
            </p>

            <div className="grid grid-cols-2 gap-3 w-full px-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => handleSuggestedPrompt(prompt.label)}
                  className="flex items-center gap-2 px-3 py-3 bg-muted hover:bg-muted/80 rounded-xl text-sm text-left border border-border transition-colors"
                >
                  <prompt.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="line-clamp-2 text-foreground">{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "assistant" ? (
                // Assistant message with avatar
                <div className="flex gap-3 max-w-[90%]">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-muted-foreground">Homi</span>
                    <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed text-foreground">
                      <ChatMarkdown content={message.content} />
                    </div>
                  </div>
                </div>
              ) : (
                // User message
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 text-sm">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator - only show before streaming starts */}
          {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === "user") && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-2 w-2 rounded-full bg-muted-foreground/50"
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

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex items-end gap-3 bg-muted rounded-2xl p-2 pl-4">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about co-ownership..."
            className="flex-1 resize-none bg-transparent text-sm focus:outline-none min-h-[40px] max-h-[120px] py-2 text-foreground placeholder:text-muted-foreground"
            rows={1}
            disabled={isLoading}
          />

          <motion.button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="h-10 w-10 rounded-xl bg-primary text-white disabled:opacity-50 flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </motion.button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-3">
          Homi can make mistakes. Verify important information.
        </p>
      </form>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Mobile: Full-screen slide-up with swipe-to-dismiss */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 400,
            }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Theme-aware glowing border - uses CSS variables (green in light, yellow in dark) */}
            <div className="absolute inset-0 rounded-[20px] m-1 chat-glow-border" />
            {/* Outer glow effect - theme aware */}
            <div className="absolute inset-0 rounded-[20px] m-1 chat-glow-outer" />
            {/* Inner content container */}
            <div className="absolute inset-[5px] rounded-[16px] bg-background flex flex-col overflow-hidden">
              {/* Drag handle area - only this area is draggable for swipe-to-dismiss */}
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.3 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 100 || info.velocity.y > 500) {
                    handleClose();
                  }
                }}
                className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-pan-y"
              >
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </motion.div>

              {/* Mobile Header - more compact */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                  </div>
                  <div>
                    <h2 className="font-heading font-semibold text-base text-foreground">Homi</h2>
                    <p className="text-[10px] text-muted-foreground">Your co-ownership guide</p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="h-11 w-11 rounded-full bg-muted hover:bg-muted/80 active:bg-muted/70 flex items-center justify-center transition-colors touch-manipulation"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Mobile Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {/* Empty state with suggested prompts */}
                {messages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>

                    <h3 className="font-heading font-semibold text-lg mb-1 text-foreground">
                      Hi, I&apos;m Homi!
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-[260px]">
                      Ask me anything about co-ownership
                    </p>

                    {/* Single column on mobile for better fit */}
                    <div className="flex flex-col gap-2 w-full px-2">
                      {SUGGESTED_PROMPTS.map((prompt) => (
                        <button
                          key={prompt.label}
                          onClick={() => handleSuggestedPrompt(prompt.label)}
                          className="flex items-center gap-2 px-3 py-3.5 bg-muted hover:bg-muted/80 active:bg-muted/70 rounded-xl text-sm text-left border border-border transition-colors touch-manipulation min-h-[48px]"
                        >
                          <prompt.icon className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-foreground">{prompt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {message.role === "assistant" ? (
                        <div className="flex gap-2 max-w-[95%]">
                          <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <span className="text-[10px] text-muted-foreground">Homi</span>
                            <div className="bg-muted rounded-2xl rounded-tl-md px-3 py-2 text-sm leading-relaxed text-foreground">
                              <ChatMarkdown content={message.content} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3 py-2 text-sm">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === "user") && (
                    <div className="flex gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
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

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Mobile Input area with safe-area padding */}
              <form onSubmit={handleSubmit} className="border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                <div className="flex items-end gap-2 bg-muted rounded-2xl p-1.5 pl-3">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about co-ownership..."
                    className="flex-1 resize-none bg-transparent text-sm focus:outline-none min-h-[40px] max-h-[100px] py-2 text-foreground placeholder:text-muted-foreground touch-manipulation text-base"
                    style={{ fontSize: "16px" }} // Prevents iOS zoom on focus
                    rows={1}
                    disabled={isLoading}
                  />

                  <motion.button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="h-11 w-11 rounded-xl bg-primary text-white disabled:opacity-50 flex items-center justify-center flex-shrink-0 touch-manipulation"
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowUp className="h-5 w-5" />
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Desktop: Modal expanding from bottom-right */}
          <div className="hidden md:block fixed inset-0 z-50 pointer-events-none">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.3,
                x: "calc(100vw - 120px)",
                y: "calc(100vh - 120px)",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: "calc(50vw - 260px)",
                y: "calc(50vh - 350px)",
              }}
              exit={{
                opacity: 0,
                scale: 0.3,
                x: "calc(100vw - 120px)",
                y: "calc(100vh - 120px)",
              }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 350,
                mass: 0.8,
              }}
              className="relative w-[520px] h-[700px] max-h-[85vh] pointer-events-auto origin-bottom-right"
            >
              {/* Animated glow border */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 50%, hsl(var(--primary)) 100%)",
                  backgroundSize: "200% 200%",
                }}
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Outer glow */}
              <motion.div
                className="absolute inset-[-4px] rounded-3xl bg-primary/20 blur-xl"
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Secondary glow layer */}
              <motion.div
                className="absolute inset-[-2px] rounded-3xl bg-primary/30 blur-lg"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
              {/* Inner content container */}
              <div className="absolute inset-[2px] rounded-3xl bg-background flex flex-col shadow-2xl overflow-hidden">
                {modalContent}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
