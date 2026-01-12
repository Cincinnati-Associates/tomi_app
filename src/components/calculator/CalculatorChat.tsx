"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMarkdown } from "@/components/shared/ChatMarkdown";
import { useSmartCalculator } from "@/hooks/useSmartCalculator";
import { useIntroAnimation } from "./SmartCalculatorPage";
import { useChat } from "ai/react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

// Quick reply options
const QUICK_REPLIES = {
  income: [
    { label: "$50-75k", value: 62500 },
    { label: "$75-100k", value: 87500 },
    { label: "$100-150k", value: 125000 },
    { label: "$150k+", value: 175000 },
  ],
  downpayment: [
    { label: "$20-50k", value: 35000 },
    { label: "$50-100k", value: 75000 },
    { label: "$100-200k", value: 150000 },
    { label: "$200k+", value: 250000 },
  ],
  monthlybudget: [
    { label: "$2,000", value: 2000 },
    { label: "$3,000", value: 3000 },
    { label: "$4,000", value: 4000 },
    { label: "$5,000+", value: 5000 },
  ],
  coBuyers: [
    { label: "2 people", value: 1 },
    { label: "3 people", value: 2 },
    { label: "4 people", value: 3 },
  ],
  confirmCoBuyers: [
    { label: "Looks good, calculate!", value: "calculate" },
    { label: "Let me adjust first", value: "adjust" },
  ],
};

// Conversation flow stages
type ConversationStage =
  | "welcome"
  | "income"
  | "downpayment"
  | "monthlybudget"
  | "cobuyers"
  | "confirm_cobuyers"
  | "calculating"
  | "results"
  | "freeform";

const STAGE_PROMPTS: Record<ConversationStage, string> = {
  welcome:
    "Hey! I'm Homi, your co-ownership guide. Let's figure out how much more home you could afford with the right co-buyer.\n\nIt takes about 2 minutes, and I won't ask for anything personal. Ready?",
  income: "Great! First, what's your approximate annual income?",
  downpayment: "Nice! How much can you contribute to the down payment?",
  monthlybudget:
    "Almost there! What's the max you'd want to pay monthly for housing?",
  cobuyers:
    "Last question: How many people total will be buying together? (including you)",
  confirm_cobuyers: "", // Dynamic - generated based on co-buyer count
  calculating: "Perfect! Crunching the numbers...",
  results: "",
  freeform: "",
};

export function CalculatorChat() {
  const {
    state,
    setIncome,
    setDownPayment,
    setMonthlyBudget,
    setCoBuyerCount,
    calculate,
  } = useSmartCalculator();

  const { introComplete } = useIntroAnimation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<ConversationStage>("welcome");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showInputGlow, setShowInputGlow] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  // Build calculator context for AI - defined early for useChat
  const buildCalculatorContext = useCallback(() => {
    const { primaryBuyer, coBuyers, results } = state;
    if (!results) return "";

    const coBuyerDetails = coBuyers
      .map(
        (cb) =>
          `- ${cb.name}: $${cb.downPaymentContribution.toLocaleString()} down, $${cb.monthlyBudget.toLocaleString()}/month`
      )
      .join("\n");

    const ownershipDetails = results.ownershipAtClose
      .map((s) => `- ${s.buyerName}: ${s.percentage.toFixed(1)}%`)
      .join("\n");

    return `
## Calculator State
PRIMARY BUYER:
- Annual income: ${formatCurrency(primaryBuyer.annualIncome)}
- Down payment contribution: ${formatCurrency(primaryBuyer.downPaymentContribution)}
- Monthly housing budget: ${formatCurrency(primaryBuyer.monthlyBudget)}

CO-OWNERS (${coBuyers.length}):
${coBuyerDetails}

RESULTS:
- Max home price together: ${formatCurrency(results.groupMax)}
- Buying alone: ${formatCurrency(results.soloMax)}
- Extra buying power: ${formatCurrency(results.unlockAmount)}

OWNERSHIP SPLITS:
${ownershipDetails}

Use this context to answer questions about their specific situation.
`.trim();
  }, [state]);

  // Streaming chat for freeform conversations
  const {
    messages: streamingMessages,
    append: appendStreamingMessage,
    isLoading: isStreamingLoading,
  } = useChat({
    api: "/api/chat",
    body: {
      calculatorContext: buildCalculatorContext(),
    },
  });

  // Show glow effect after intro animation completes
  useEffect(() => {
    if (introComplete && !hasInitialized.current) {
      // Short delay after intro completes to show glow
      const timer = setTimeout(() => {
        setShowInputGlow(true);
        // Auto-hide glow after a few seconds
        setTimeout(() => setShowInputGlow(false), 4000);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [introComplete]);

  // Add assistant message helper
  const addAssistantMessage = useCallback((content: string) => {
    const message: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  }, []);

  // Add user message helper
  const addUserMessage = useCallback((content: string) => {
    const message: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  }, []);

  // Initialize with welcome message (only once)
  useEffect(() => {
    if (messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setTimeout(() => {
        addAssistantMessage(STAGE_PROMPTS.welcome);
        setShowQuickReplies(true);
      }, 500);
    }
  }, [messages.length, addAssistantMessage]);

  // Watch for calculation completion and add results message
  const hasAddedResultsRef = useRef(false);
  useEffect(() => {
    if (state.hasCalculated && state.results && stage === "calculating" && !hasAddedResultsRef.current) {
      hasAddedResultsRef.current = true;
      // State is now updated, generate results message
      const { results, coBuyers } = state;
      const { soloMax, groupMax, unlockAmount, monthlyPayment, ownershipAtClose } = results;
      const totalBuyers = coBuyers.length + 1;
      const monthlyPerPerson = Math.round(monthlyPayment / totalBuyers);
      void soloMax; // unused but kept for potential future use

      const ownershipBreakdown = ownershipAtClose
        .map((split) => `• ${split.buyerName}: ${split.percentage.toFixed(0)}% ownership`)
        .join("\n");

      const resultsMessage =
        `Here's what I found:\n\n` +
        `🏠 Together you could afford: ${formatCurrency(groupMax)}\n` +
        `(vs ${formatCurrency(soloMax)} on your own${soloMax > 0 ? ` — that's +${formatCurrency(unlockAmount)}!` : ""})\n\n` +
        `Based on everyone's down payment contributions:\n` +
        `${ownershipBreakdown}\n\n` +
        `Your estimated monthly payment would be ~${formatCurrency(monthlyPerPerson)} each.\n\n` +
        `Want to adjust the numbers or ask me anything about co-ownership?`;

      addAssistantMessage(resultsMessage);
      setStage("freeform");
    }
  }, [state.hasCalculated, state.results, stage, state, addAssistantMessage]);

  // Scroll to bottom within chat container only (not the page)
  useEffect(() => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement?.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages]);

  // Generate co-buyer assumption message
  const generateCoBuyerAssumptionMessage = useCallback(
    (coBuyerCount: number) => {
      const { primaryBuyer } = state;
      const downPayment = formatCurrency(primaryBuyer.downPaymentContribution);
      const monthlyBudget = formatCurrency(primaryBuyer.monthlyBudget);

      return (
        `Perfect! I've added ${coBuyerCount} co-owner${coBuyerCount > 1 ? "s" : ""} to your calculation.\n\n` +
        `I'm assuming they can each contribute the same as you:\n` +
        `• Down payment: ${downPayment} each\n` +
        `• Monthly budget: ${monthlyBudget} each\n\n` +
        `If that's not right, you can adjust each person's numbers in the Co-Owner Contributions panel on the right. →\n\n` +
        `Otherwise, let me calculate what you could afford together!`
      );
    },
    [state]
  );

  // Handle stage transitions
  const advanceStage = useCallback(
    (currentStage: ConversationStage, extraData?: { coBuyerCount?: number }) => {
      setIsLoading(true);
      setShowQuickReplies(false);

      setTimeout(() => {
        setIsLoading(false);

        switch (currentStage) {
          case "welcome":
            setStage("income");
            addAssistantMessage(STAGE_PROMPTS.income);
            setShowQuickReplies(true);
            break;

          case "income":
            setStage("downpayment");
            addAssistantMessage(STAGE_PROMPTS.downpayment);
            setShowQuickReplies(true);
            break;

          case "downpayment":
            setStage("monthlybudget");
            addAssistantMessage(STAGE_PROMPTS.monthlybudget);
            setShowQuickReplies(true);
            break;

          case "monthlybudget":
            setStage("cobuyers");
            addAssistantMessage(STAGE_PROMPTS.cobuyers);
            setShowQuickReplies(true);
            break;

          case "cobuyers":
            setStage("confirm_cobuyers");
            // Generate dynamic message based on co-buyer count
            const coBuyerCount = extraData?.coBuyerCount ?? 1;
            addAssistantMessage(generateCoBuyerAssumptionMessage(coBuyerCount));
            setShowQuickReplies(true);
            break;

          case "confirm_cobuyers":
            setStage("calculating");
            addAssistantMessage(STAGE_PROMPTS.calculating);
            // Trigger calculation after short delay - results message will be added by useEffect
            setTimeout(() => {
              calculate();
            }, 1500);
            break;
        }
      }, 600);
    },
    [addAssistantMessage, calculate, generateCoBuyerAssumptionMessage]
  );

  // Note: generateResultsMessage was removed - results messages are generated inline above

  // Handle quick reply click
  const handleQuickReply = (value: number | string) => {
    let displayText = "";

    switch (stage) {
      case "welcome":
        displayText = "Let's do it!";
        addUserMessage(displayText);
        advanceStage("welcome");
        break;

      case "income":
        displayText = formatCurrency(value as number);
        addUserMessage(displayText);
        setIncome(value as number);
        advanceStage("income");
        break;

      case "downpayment":
        displayText = formatCurrency(value as number);
        addUserMessage(displayText);
        setDownPayment(value as number);
        advanceStage("downpayment");
        break;

      case "monthlybudget":
        displayText = `${formatCurrency(value as number)}/month`;
        addUserMessage(displayText);
        setMonthlyBudget(value as number);
        advanceStage("monthlybudget");
        break;

      case "cobuyers":
        const coBuyerCount = value as number;
        displayText = `${coBuyerCount + 1} people`;
        addUserMessage(displayText);
        setCoBuyerCount(coBuyerCount);
        advanceStage("cobuyers", { coBuyerCount });
        break;

      case "confirm_cobuyers":
        if (value === "calculate") {
          displayText = "Looks good, calculate!";
          addUserMessage(displayText);
          advanceStage("confirm_cobuyers");
        } else {
          displayText = "Let me adjust first";
          addUserMessage(displayText);
          // Stay on same stage but hide quick replies
          setShowQuickReplies(false);
          setTimeout(() => {
            addAssistantMessage(
              "No problem! Take your time adjusting the numbers in the panel on the right. Just let me know when you're ready to calculate!"
            );
          }, 500);
        }
        break;
    }
  };

  // Handle free-form text input
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userInput = inputValue.trim();
    setInputValue("");
    addUserMessage(userInput);

    // Handle based on current stage
    if (stage === "welcome") {
      advanceStage("welcome");
      return;
    }

    // Handle "ready to calculate" in confirm stage
    if (stage === "confirm_cobuyers") {
      const lower = userInput.toLowerCase();
      if (
        lower.includes("ready") ||
        lower.includes("calculate") ||
        lower.includes("go") ||
        lower.includes("yes")
      ) {
        advanceStage("confirm_cobuyers");
        return;
      }
    }

    // Try to parse numeric input for structured stages
    const numericValue = parseNumericInput(userInput);

    if (numericValue !== null) {
      switch (stage) {
        case "income":
          setIncome(numericValue);
          advanceStage("income");
          return;
        case "downpayment":
          setDownPayment(numericValue);
          advanceStage("downpayment");
          return;
        case "monthlybudget":
          setMonthlyBudget(numericValue);
          advanceStage("monthlybudget");
          return;
        case "cobuyers":
          const count = Math.max(1, Math.min(3, numericValue - 1));
          setCoBuyerCount(count);
          advanceStage("cobuyers", { coBuyerCount: count });
          return;
      }
    }

    // For freeform stage or unrecognized input, use streaming AI
    if (stage === "freeform" || stage === "results" || stage === "confirm_cobuyers") {
      // Use streaming chat - the response will be added to streamingMessages
      await appendStreamingMessage({ role: "user", content: userInput });
    }
  };

  // Get quick replies for current stage
  const getCurrentQuickReplies = () => {
    switch (stage) {
      case "welcome":
        return [{ label: "Let's do it!", value: "start" }];
      case "income":
        return QUICK_REPLIES.income;
      case "downpayment":
        return QUICK_REPLIES.downpayment;
      case "monthlybudget":
        return QUICK_REPLIES.monthlybudget;
      case "cobuyers":
        return QUICK_REPLIES.coBuyers;
      case "confirm_cobuyers":
        return QUICK_REPLIES.confirmCoBuyers;
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:px-6 md:py-4 bg-background">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-foreground">
            Smart Calculator
          </h2>
          <p className="text-xs text-muted-foreground">
            Chat with Homi to find your buying power
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-4">
          {/* Structured conversation messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                )}
              >
                {message.role === "assistant" ? (
                  <ChatMarkdown content={message.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Streaming AI messages (freeform stage) */}
          {streamingMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                )}
              >
                {message.role === "assistant" ? (
                  <ChatMarkdown content={message.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator - show for structured stages, or streaming before response starts */}
          {(isLoading || (isStreamingLoading && (streamingMessages.length === 0 || streamingMessages[streamingMessages.length - 1]?.role === "user"))) && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      {showQuickReplies && getCurrentQuickReplies().length > 0 && (
        <motion.div
          className="px-4 pb-2 md:px-6"
          initial={false}
          animate={showInputGlow ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.5, repeat: showInputGlow ? 2 : 0 }}
        >
          <div className={cn(
            "flex flex-wrap gap-2 p-2 -m-2 rounded-xl transition-all duration-500",
            showInputGlow && "bg-primary/5 ring-2 ring-primary/30 ring-offset-2"
          )}>
            {getCurrentQuickReplies().map((option, index) => (
              <motion.button
                key={option.label}
                onClick={() => handleQuickReply(option.value)}
                className={cn(
                  "px-4 py-2 rounded-full border-2 border-primary/30 text-primary text-sm font-medium",
                  "hover:bg-primary/5 hover:border-primary/50 transition-all",
                  showInputGlow && "border-primary/50 shadow-md"
                )}
                animate={showInputGlow ? {
                  scale: [1, 1.05, 1],
                  transition: { delay: index * 0.1, duration: 0.4 }
                } : {}}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border p-4 md:p-6">
        <motion.div
          className={cn(
            "flex gap-2 p-1 -m-1 rounded-full transition-all duration-500",
            showInputGlow && "ring-2 ring-primary/40 ring-offset-2 bg-primary/5"
          )}
          animate={showInputGlow ? {
            boxShadow: ["0 0 0 0 rgba(45, 90, 74, 0)", "0 0 20px 4px rgba(45, 90, 74, 0.3)", "0 0 0 0 rgba(45, 90, 74, 0)"]
          } : {}}
          transition={{ duration: 1.5, repeat: showInputGlow ? 2 : 0 }}
        >
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              stage === "freeform"
                ? "Ask about co-ownership..."
                : "Or type your answer..."
            }
            className="flex-1 rounded-full"
            disabled={isLoading || isStreamingLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full"
            disabled={!inputValue.trim() || isLoading || isStreamingLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </motion.div>
      </form>
    </div>
  );
}

// Helper: Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper: Parse numeric input from natural language
function parseNumericInput(input: string): number | null {
  // Remove common words and symbols
  const cleaned = input
    .toLowerCase()
    .replace(/[$,]/g, "")
    .replace(/\s*(per|a|\/)\s*(month|year|yr|mo)/g, "")
    .replace(/around|about|roughly|approximately/g, "")
    .trim();

  // Handle "k" notation (e.g., "85k" -> 85000)
  const kMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*k$/);
  if (kMatch) {
    return parseFloat(kMatch[1]) * 1000;
  }

  // Handle plain numbers
  const num = parseFloat(cleaned);
  if (!isNaN(num)) {
    return num;
  }

  return null;
}
