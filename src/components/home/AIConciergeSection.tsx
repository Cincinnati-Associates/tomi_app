"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Sparkles, FileText, DollarSign, Calendar, Shield, TrendingUp, Bell, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// DATA
// ============================================

interface CoOwner {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

interface ChatMessage {
  sender: "homi" | string;
  text: string;
}

interface Scenario {
  id: string;
  title: string;
  messages: ChatMessage[];
}

const coOwners: CoOwner[] = [
  { id: "marcus", name: "Marcus", color: "bg-blue-500", textColor: "text-blue-500" },
  { id: "sarah", name: "Sarah", color: "bg-emerald-500", textColor: "text-emerald-500" },
  { id: "alex", name: "Alex", color: "bg-orange-500", textColor: "text-orange-500" },
];

const scenarios: Scenario[] = [
  {
    id: "tax",
    title: "Tax Season",
    messages: [
      { sender: "marcus", text: "When is property tax due?" },
      { sender: "homi", text: "December 10th. Based on your 35% share, your portion is $1,847. I'll send reminders to everyone next week." },
      { sender: "sarah", text: "What can I deduct on my taxes?" },
      { sender: "homi", text: "You can deduct your share of mortgage interest and property tax. I'll prepare your breakdown before April." },
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance",
    messages: [
      { sender: "alex", text: "The roof needs repair. $8,000 quote." },
      { sender: "homi", text: "I've logged this in decisions. Based on your agreement, repairs over $5K need group approval. Marcus and Sarah—thoughts?" },
      { sender: "sarah", text: "Can we see other quotes first?" },
      { sender: "homi", text: "Good call. I'll help you request 2 more quotes. Here's a template..." },
    ],
  },
  {
    id: "equity",
    title: "Equity Check",
    messages: [
      { sender: "sarah", text: "What's my current equity?" },
      { sender: "homi", text: "You own 35% ($127,500). You've contributed $45K down + 18 months of payments. Here's your breakdown..." },
      { sender: "marcus", text: "How does that compare to mine?" },
      { sender: "homi", text: "Marcus, you're at 40% ($145,000). The 5% difference reflects your larger down payment." },
    ],
  },
  {
    id: "exit",
    title: "Exit Planning",
    messages: [
      { sender: "alex", text: "I might need to sell my share next year." },
      { sender: "homi", text: "I understand. Per your TIC agreement, you'll need to give 90 days notice. Marcus and Sarah have first right of refusal." },
      { sender: "marcus", text: "What would that cost us to buy Alex out?" },
      { sender: "homi", text: "At current value, Alex's 25% would be ~$91,250. I can model financing options for both of you." },
    ],
  },
  {
    id: "bills",
    title: "Bill Splitting",
    messages: [
      { sender: "marcus", text: "Water bill came in. $180 this month." },
      { sender: "homi", text: "Got it. Based on your usage split, that's $72 for Marcus, $63 for Sarah, and $45 for Alex. Added to expenses." },
      { sender: "sarah", text: "Can I see our total expenses this month?" },
      { sender: "homi", text: "This month: $2,847 total. Your share is $997. Mortgage, utilities, and insurance all included." },
    ],
  },
  {
    id: "documents",
    title: "Document Access",
    messages: [
      { sender: "sarah", text: "I need a copy of our TIC agreement for my accountant." },
      { sender: "homi", text: "Here's your TIC agreement, signed March 2024. I can also generate a summary of tax-relevant details." },
      { sender: "alex", text: "Can you send me the insurance policy too?" },
      { sender: "homi", text: "Done. I've emailed both of you the relevant documents. Let me know if your accountant needs anything else." },
    ],
  },
];

const capabilities = [
  { icon: Sparkles, label: "AI-powered guidance" },
  { icon: FileText, label: "Legal agreements" },
  { icon: Shield, label: "Ongoing support" },
  { icon: TrendingUp, label: "Equity tracking" },
  { icon: DollarSign, label: "Expense splitting" },
  { icon: Calendar, label: "Payment reminders" },
  { icon: Bell, label: "Maintenance alerts" },
];

// ============================================
// SUB-COMPONENTS
// ============================================

// Homi Avatar with glow effect
function HomiAvatar({ isTyping, size = "md" }: { isTyping: boolean; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="relative flex-shrink-0">
      <motion.div
        className={cn(
          sizeClasses[size],
          "rounded-full bg-primary flex items-center justify-center shadow-lg"
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
        <Sparkles className={cn(iconSizes[size], "text-primary-foreground")} />
      </motion.div>
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

// Co-owner avatar
function CoOwnerAvatar({ coOwner, size = "md" }: { coOwner: CoOwner; size?: "sm" | "md" }) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        coOwner.color,
        "rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      )}
    >
      {coOwner.name[0]}
    </div>
  );
}

// Typing indicator
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary/60"
          animate={{
            y: [0, -4, 0],
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

// Chat bubble for co-owners
function CoOwnerBubble({
  coOwner,
  text,
  onClick,
}: {
  coOwner: CoOwner;
  text: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-start gap-2 w-full text-left group"
      whileTap={{ scale: 0.98 }}
    >
      <CoOwnerAvatar coOwner={coOwner} size="sm" />
      <div className="flex-1 min-w-0">
        <span className={cn("text-xs font-medium", coOwner.textColor)}>{coOwner.name}</span>
        <div
          className={cn(
            "mt-1 px-3 py-2 rounded-2xl rounded-tl-md",
            "bg-muted text-foreground text-sm",
            "group-hover:bg-muted/80 transition-colors"
          )}
        >
          {text}
        </div>
      </div>
    </motion.button>
  );
}

// Chat bubble for Homi
function HomiBubble({
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
      }, 100);

      return () => clearInterval(interval);
    } else {
      setDisplayedText(text);
      setIsComplete(true);
    }
  }, [text, isTyping]);

  return (
    <motion.button
      onClick={onClick}
      className="flex items-start gap-2 w-full text-left group"
      whileTap={{ scale: 0.98 }}
    >
      <HomiAvatar isTyping={isTyping && !isComplete} size="sm" />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-primary">Homi</span>
        <motion.div
          className={cn(
            "mt-1 px-3 py-2 rounded-2xl rounded-tl-md",
            "bg-card text-foreground text-sm leading-relaxed",
            "border-2 border-transparent",
            "group-hover:bg-card/80 transition-colors"
          )}
          style={{
            background:
              "linear-gradient(hsl(var(--card)), hsl(var(--card))) padding-box, linear-gradient(135deg, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.4)) border-box",
          }}
          animate={{
            boxShadow: isComplete
              ? "0 0 10px hsl(var(--primary) / 0.1)"
              : "0 0 20px hsl(var(--primary) / 0.25)",
          }}
        >
          {displayedText}
          {!isComplete && (
            <motion.span
              className="inline-block w-0.5 h-3 bg-primary ml-0.5 align-middle"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>
    </motion.button>
  );
}

// Progress dots
function ScenarioProgressDots({
  total,
  current,
  onDotClick,
}: {
  total: number;
  current: number;
  onDotClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i === current
              ? "bg-primary w-6"
              : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"
          )}
          aria-label={`Go to scenario ${i + 1}: ${scenarios[i].title}`}
        />
      ))}
    </div>
  );
}

// Capability chips
function CapabilityChips() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {capabilities.map((cap) => (
        <div
          key={cap.label}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-card border border-border",
            "text-sm font-medium text-foreground whitespace-nowrap",
            "flex-shrink-0"
          )}
        >
          <cap.icon className="w-4 h-4 text-primary" />
          {cap.label}
        </div>
      ))}
    </div>
  );
}

// Network Hub Visual (Desktop only)
function NetworkHubVisual({ isTyping }: { isTyping: boolean }) {
  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
      {/* SVG for connections */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
        {/* Connection lines with energy pulse */}
        {/* Co-owners to Homi */}
        <motion.path
          d="M 80 80 Q 150 100 200 150"
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="2"
        />
        <motion.path
          d="M 80 150 L 200 150"
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="2"
        />
        <motion.path
          d="M 80 220 Q 150 200 200 150"
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="2"
        />

        {/* Homi to data nodes */}
        <motion.path
          d="M 200 150 Q 250 100 320 80"
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="2"
        />
        <motion.path
          d="M 200 150 Q 250 130 320 130"
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="2"
        />
        <motion.path
          d="M 200 150 Q 250 170 320 170"
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="2"
        />
        <motion.path
          d="M 200 150 Q 250 200 320 220"
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="2"
        />

        {/* Energy pulse overlay - animated */}
        {isTyping && (
          <>
            <motion.circle
              r="4"
              fill="hsl(var(--primary))"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                offsetDistance: ["0%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ offsetPath: "path('M 80 150 L 200 150')" }}
            />
            <motion.circle
              r="4"
              fill="hsl(var(--primary))"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                offsetDistance: ["0%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
                delay: 0.5,
              }}
              style={{ offsetPath: "path('M 200 150 Q 250 130 320 130')" }}
            />
          </>
        )}
      </svg>

      {/* Co-owner nodes */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-8">
        {coOwners.map((coOwner) => (
          <div key={coOwner.id} className="flex items-center gap-2">
            <CoOwnerAvatar coOwner={coOwner} size="md" />
            <span className="text-sm font-medium text-foreground">{coOwner.name}</span>
          </div>
        ))}
      </div>

      {/* Homi center node */}
      <div className="relative z-10">
        <HomiAvatar isTyping={isTyping} size="lg" />
      </div>

      {/* Data nodes */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-4">
        {[
          { icon: TrendingUp, label: "Equity" },
          { icon: FileText, label: "Legal" },
          { icon: Calendar, label: "Tax" },
          { icon: DollarSign, label: "Bills" },
        ].map((node) => (
          <motion.div
            key={node.label}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full",
              "bg-card border border-border text-xs font-medium"
            )}
            animate={{
              boxShadow: isTyping
                ? [
                    "0 0 8px hsl(var(--primary) / 0.2)",
                    "0 0 16px hsl(var(--primary) / 0.4)",
                    "0 0 8px hsl(var(--primary) / 0.2)",
                  ]
                : "0 0 8px hsl(var(--primary) / 0.1)",
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <node.icon className="w-3.5 h-3.5 text-primary" />
            {node.label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Group chat simulation
function GroupChatSimulation({
  onOpenChat,
}: {
  onOpenChat: (message: string) => void;
}) {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isTypingResponse, setIsTypingResponse] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.2 });

  const currentScenario = scenarios[currentScenarioIndex];
  const currentMessages = currentScenario.messages;

  // Auto-play sequence
  useEffect(() => {
    if (!isInView || isPaused) return;

    let timeout: NodeJS.Timeout;

    if (visibleMessages < currentMessages.length) {
      const nextMessage = currentMessages[visibleMessages];
      const isHomiMessage = nextMessage.sender === "homi";

      if (isHomiMessage && !isTypingResponse) {
        // Show typing indicator before Homi responds
        setIsTypingResponse(true);
        timeout = setTimeout(() => {
          setIsTypingResponse(false);
          setVisibleMessages((v) => v + 1);
        }, 600);
      } else if (!isHomiMessage) {
        // Show co-owner message after delay
        timeout = setTimeout(() => {
          setVisibleMessages((v) => v + 1);
        }, 800);
      }
    } else {
      // All messages shown, wait then move to next scenario
      timeout = setTimeout(() => {
        setCurrentScenarioIndex((i) => (i + 1) % scenarios.length);
        setVisibleMessages(0);
        setIsTypingResponse(false);
      }, 4000);
    }

    return () => clearTimeout(timeout);
  }, [isInView, isPaused, visibleMessages, currentMessages, isTypingResponse]);

  // Reset when scenario changes
  useEffect(() => {
    setVisibleMessages(0);
    setIsTypingResponse(false);
  }, [currentScenarioIndex]);

  const handleBubbleClick = useCallback(
    (text: string) => {
      setIsPaused(true);
      onOpenChat(text);
      setTimeout(() => setIsPaused(false), 30000);
    },
    [onOpenChat]
  );

  const handleDotClick = useCallback((index: number) => {
    setIsPaused(true);
    setCurrentScenarioIndex(index);
    setVisibleMessages(0);
    setIsTypingResponse(false);
    setTimeout(() => setIsPaused(false), 10000);
  }, []);

  const getCoOwner = (id: string) => coOwners.find((c) => c.id === id)!;

  return (
    <div ref={ref} className="flex flex-col h-full">
      {/* Chat container */}
      <div className="flex-1 bg-background rounded-2xl border border-border p-4 min-h-[320px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
          <div className="flex -space-x-2">
            {coOwners.map((co) => (
              <CoOwnerAvatar key={co.id} coOwner={co} size="sm" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <HomiAvatar isTyping={isTypingResponse} size="sm" />
            <div>
              <p className="text-sm font-semibold text-foreground">Group Chat</p>
              <p className="text-xs text-muted-foreground">3 co-owners + Homi</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3">
          <AnimatePresence mode="sync">
            {currentMessages.slice(0, visibleMessages).map((msg, idx) => {
              const isHomi = msg.sender === "homi";
              const coOwner = !isHomi ? getCoOwner(msg.sender) : null;
              const isLastHomiMessage =
                isHomi && idx === visibleMessages - 1 && visibleMessages <= currentMessages.length;

              return (
                <motion.div
                  key={`${currentScenario.id}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isHomi ? (
                    <HomiBubble
                      text={msg.text}
                      onClick={() => handleBubbleClick(msg.text)}
                      isTyping={isLastHomiMessage}
                    />
                  ) : (
                    <CoOwnerBubble
                      coOwner={coOwner!}
                      text={msg.text}
                      onClick={() => handleBubbleClick(msg.text)}
                    />
                  )}
                </motion.div>
              );
            })}

            {/* Typing indicator */}
            {isTypingResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2"
              >
                <HomiAvatar isTyping={true} size="sm" />
                <div className="bg-card rounded-2xl rounded-tl-md border border-border">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress dots */}
      <div className="mt-4">
        <ScenarioProgressDots
          total={scenarios.length}
          current={currentScenarioIndex}
          onDotClick={handleDotClick}
        />
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-muted-foreground mt-2">
        Tap any message to chat with Homi
      </p>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

interface AIConciergeProps {
  onOpenChat: (message: string) => void;
}

export function AIConciergeSection({ onOpenChat }: AIConciergeProps) {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.1 });
  const [isHomiTyping, setIsHomiTyping] = useState(false);

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
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
            Introducing
          </p>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl mb-4">
            AI-Powered Co-Ownership
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            One AI assistant that keeps every co-owner informed, aligned, and on track.
          </p>
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Desktop: Two columns */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Network visual - desktop only */}
            <div className="hidden lg:block">
              <div className="bg-background rounded-2xl border border-border p-6 h-full">
                <NetworkHubVisual isTyping={isHomiTyping} />
              </div>
            </div>

            {/* Chat simulation - always visible */}
            <div>
              <GroupChatSimulation onOpenChat={onOpenChat} />
            </div>
          </div>

          {/* Capability chips */}
          <div className="mt-8 md:mt-12">
            <CapabilityChips />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
