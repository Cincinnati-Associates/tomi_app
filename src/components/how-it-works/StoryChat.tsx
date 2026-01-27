"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, MessageCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StoryProgress {
  currentStep: {
    id: string;
    message: string;
    interaction: {
      type: "continue" | "multiple-choice" | "text-input" | "cta";
      buttonText?: string;
      options?: { label: string; value: string }[];
      placeholder?: string;
      ctaButtons?: { label: string; href?: string; action?: "restart" | "chat"; primary?: boolean }[];
    };
  };
  advance: (response?: string) => void;
  restart: () => void;
}

interface StoryChatProps {
  storyProgress: StoryProgress;
  onOpenHomiChat: () => void;
  compact?: boolean;
}

export function StoryChat({ storyProgress, onOpenHomiChat, compact = false }: StoryChatProps) {
  const { currentStep, advance, restart } = storyProgress;
  const [isTyping, setIsTyping] = useState(true);
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [textInput, setTextInput] = useState("");

  // Typewriter effect for AI messages
  useEffect(() => {
    setIsTyping(true);
    setDisplayedMessage("");

    const message = currentStep.message;
    let index = 0;

    const timer = setInterval(() => {
      if (index < message.length) {
        setDisplayedMessage(message.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 20); // Speed of typewriter

    return () => clearInterval(timer);
  }, [currentStep.id, currentStep.message]);

  const handleContinue = () => {
    advance();
  };

  const handleOptionSelect = (value: string) => {
    advance(value);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      advance(textInput.trim());
      setTextInput("");
    }
  };

  const handleCtaClick = (button: { href?: string; action?: "restart" | "chat" }) => {
    if (button.action === "restart") {
      restart();
    } else if (button.action === "chat") {
      onOpenHomiChat();
    }
    // href buttons are handled by Link
  };

  return (
    <div className={cn("flex flex-col h-full", compact && "")}>
      {/* Chat Header */}
      <div className={cn(
        "flex items-center gap-3 border-b border-border bg-card",
        compact ? "px-4 py-2" : "px-6 py-4"
      )}>
        <div className="relative">
          <div className={cn(
            "rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center",
            compact ? "h-8 w-8" : "h-10 w-10"
          )}>
            <Sparkles className={cn("text-primary-foreground", compact ? "h-4 w-4" : "h-5 w-5")} />
          </div>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />
        </div>
        <div>
          <h3 className={cn("font-heading font-semibold text-foreground", compact ? "text-sm" : "text-base")}>
            Homi
          </h3>
          {!compact && (
            <p className="text-xs text-muted-foreground">Your guide to co-ownership</p>
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className={cn(
        "flex-1 overflow-hidden flex flex-col justify-center",
        compact ? "p-3" : "p-6"
      )}>
        <div className="space-y-4">
          {/* AI Message */}
          <div className="flex gap-3">
            <div className={cn(
              "flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center",
              compact ? "h-6 w-6" : "h-8 w-8"
            )}>
              <Sparkles className={cn("text-primary", compact ? "h-3 w-3" : "h-4 w-4")} />
            </div>
            <div className="flex-1 space-y-1">
              {!compact && <span className="text-xs text-muted-foreground">Homi</span>}
              <motion.div
                className={cn(
                  "bg-muted rounded-2xl rounded-tl-md text-foreground",
                  compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm leading-relaxed"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="whitespace-pre-wrap">{displayedMessage}</p>
                {isTyping && (
                  <motion.span
                    className="inline-block w-1.5 h-4 bg-primary ml-0.5 rounded-sm"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Interaction Area */}
      <AnimatePresence mode="wait">
        {!isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "border-t border-border bg-card",
              compact ? "p-3" : "p-4"
            )}
          >
            {/* Continue Button */}
            {currentStep.interaction.type === "continue" && (
              <Button
                onClick={handleContinue}
                className="w-full rounded-full"
                size={compact ? "default" : "lg"}
              >
                {currentStep.interaction.buttonText || "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {/* Multiple Choice */}
            {currentStep.interaction.type === "multiple-choice" && (
              <div className={cn("space-y-2", compact && "space-y-1.5")}>
                {currentStep.interaction.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value)}
                    className={cn(
                      "w-full text-left rounded-xl border border-border bg-muted/50 hover:bg-muted hover:border-primary/50 transition-colors",
                      compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* Text Input */}
            {currentStep.interaction.type === "text-input" && (
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={currentStep.interaction.placeholder || "Type your answer..."}
                  className={cn(
                    "flex-1 rounded-full bg-muted border border-border px-4 focus:outline-none focus:border-primary",
                    compact ? "py-2 text-sm" : "py-3"
                  )}
                />
                <Button type="submit" size="icon" className="rounded-full h-10 w-10">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}

            {/* CTA Buttons */}
            {currentStep.interaction.type === "cta" && (
              <div className={cn("space-y-2", compact && "space-y-1.5")}>
                {currentStep.interaction.ctaButtons?.map((button, index) => {
                  if (button.href) {
                    return (
                      <Button
                        key={index}
                        asChild
                        variant={button.primary ? "glow" : "outline"}
                        className="w-full rounded-full"
                        size={compact ? "default" : "lg"}
                      >
                        <Link href={button.href}>{button.label}</Link>
                      </Button>
                    );
                  }

                  return (
                    <Button
                      key={index}
                      onClick={() => handleCtaClick(button)}
                      variant={button.primary ? "glow" : "outline"}
                      className="w-full rounded-full"
                      size={compact ? "default" : "lg"}
                    >
                      {button.action === "chat" && <MessageCircle className="mr-2 h-4 w-4" />}
                      {button.action === "restart" && <RotateCcw className="mr-2 h-4 w-4" />}
                      {button.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
