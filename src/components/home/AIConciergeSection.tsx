"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Sparkles, DollarSign, Hammer, CalendarClock, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// DATA
// ============================================

interface CoOwner {
  id: string;
  name: string;
  initial: string;
}

interface ChatMessage {
  sender: "homi" | string;
  text: string;
}

interface Topic {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

interface Scenario {
  id: string;
  topicId: string;
  messages: ChatMessage[];
}

const coOwners: CoOwner[] = [
  { id: "marcus", name: "Marcus", initial: "M" },
  { id: "sarah", name: "Sarah", initial: "S" },
  { id: "alex", name: "Alex", initial: "A" },
];

const topics: Topic[] = [
  {
    id: "finances",
    label: "Finances",
    description: "Track expenses, split bills automatically, and get quarterly reports",
    icon: DollarSign
  },
  {
    id: "improvements",
    label: "Improvements",
    description: "Analyze ROI on upgrades and coordinate home improvement projects",
    icon: Hammer
  },
  {
    id: "planning",
    label: "Planning",
    description: "Model buyouts, exits, and changes to your ownership structure",
    icon: CalendarClock
  },
  {
    id: "disagreements",
    label: "Disagreements",
    description: "Draft proposals, find compromises, and reference your agreements",
    icon: Scale
  },
];

const scenarios: Scenario[] = [
  {
    id: "bills",
    topicId: "finances",
    messages: [
      { sender: "marcus", text: "Mortgage payment hit. $3,200 this month." },
      { sender: "homi", text: "Split evenly: $1,067 each. I've already sent payment reminders to everyone and logged it in your shared ledger." },
      { sender: "sarah", text: "What's our total spending this quarter?" },
      { sender: "homi", text: "Q1 total: $14,847. You're 8% under budget. I can generate a full breakdown with charts if you'd like." },
    ],
  },
  {
    id: "backyard",
    topicId: "improvements",
    messages: [
      { sender: "alex", text: "I got a quote for the backyard patio. $12,000." },
      { sender: "homi", text: "Nice! Want me to put together a cost-benefit analysis? I can estimate the ROI based on comparable home values in your area." },
      { sender: "marcus", text: "Yes please. How long would that take?" },
      { sender: "homi", text: "Give me 30 seconds. I'll pull recent sales data, calculate the likely value add, and model your payback period." },
    ],
  },
  {
    id: "exit",
    topicId: "planning",
    messages: [
      { sender: "alex", text: "I might need to sell my share next year." },
      { sender: "homi", text: "I've pulled up your TIC agreement. You'll need 90 days notice, and Marcus and Sarah have first right of refusal at fair market value." },
      { sender: "marcus", text: "What would buying Alex out cost us?" },
      { sender: "homi", text: "At current value, Alex's 33% is ~$127K. I can model financing options and show how it affects your monthly costs." },
    ],
  },
  {
    id: "dispute",
    topicId: "disagreements",
    messages: [
      { sender: "sarah", text: "I want to rent my room on Airbnb when I travel. Marcus isn't sure." },
      { sender: "homi", text: "Per your agreement, short-term rentals need majority approval. I can draft a proposal with guest rules, revenue split, and liability coverage for everyone to review." },
      { sender: "marcus", text: "That would help. What do other co-owners typically agree to?" },
      { sender: "homi", text: "Most groups allow 30-60 days/year with a 24-hour guest approval window. I'll include those benchmarks in the proposal." },
    ],
  },
];

// ============================================
// SUB-COMPONENTS
// ============================================

// Homi Avatar with glow effect
function HomiAvatar({ isTyping, size = "md" }: { isTyping: boolean; size?: "sm" | "md" }) {
  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
  };
  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };

  return (
    <div className="relative flex-shrink-0">
      <motion.div
        className={cn(
          sizeClasses[size],
          "rounded-full bg-primary flex items-center justify-center"
        )}
        animate={{
          boxShadow: isTyping
            ? [
                "0 0 12px hsl(var(--primary) / 0.4)",
                "0 0 20px hsl(var(--primary) / 0.6)",
                "0 0 12px hsl(var(--primary) / 0.4)",
              ]
            : "0 0 8px hsl(var(--primary) / 0.3)",
        }}
        transition={{
          duration: 1.2,
          repeat: isTyping ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <Sparkles className={cn(iconSizes[size], "text-primary-foreground")} />
      </motion.div>
    </div>
  );
}

// Co-owner avatar - hollow circle with primary stroke
function CoOwnerAvatar({ coOwner, size = "md" }: { coOwner: CoOwner; size?: "sm" | "md" }) {
  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-7 h-7 text-xs",
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-full flex items-center justify-center font-semibold flex-shrink-0",
        "border-2 border-primary bg-card text-primary"
      )}
    >
      {coOwner.initial}
    </div>
  );
}

// Typewriter text component
function TypewriterText({
  text,
  isAnimating,
  onComplete,
  speed = 30,
}: {
  text: string;
  isAnimating: boolean;
  onComplete?: () => void;
  speed?: number;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!isAnimating) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText("");
    setIsComplete(false);
    completedRef.current = false;
    let charIndex = 0;

    const interval = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, isAnimating, speed, onComplete]);

  return (
    <>
      {displayedText}
      {isAnimating && !isComplete && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </>
  );
}

// Chat bubble for co-owners (right-aligned) with typewriter
function CoOwnerBubble({
  coOwner,
  text,
  onClick,
  isAnimating,
  onAnimationComplete,
}: {
  coOwner: CoOwner;
  text: string;
  onClick: () => void;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-end gap-2 w-full justify-end text-left group"
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={cn(
          "px-3 py-2 rounded-2xl rounded-br-md max-w-[85%]",
          "bg-muted text-foreground text-sm",
          "group-hover:bg-muted/80 transition-colors"
        )}
      >
        <TypewriterText
          text={text}
          isAnimating={isAnimating}
          onComplete={onAnimationComplete}
          speed={25}
        />
      </div>
      <CoOwnerAvatar coOwner={coOwner} size="sm" />
    </motion.button>
  );
}

// Chat bubble for Homi (left-aligned) with typewriter
function HomiBubble({
  text,
  onClick,
  isAnimating,
  onAnimationComplete,
}: {
  text: string;
  onClick: () => void;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-end gap-2 w-full text-left group"
      whileTap={{ scale: 0.98 }}
    >
      <HomiAvatar isTyping={isAnimating} size="sm" />
      <motion.div
        className={cn(
          "px-3 py-2 rounded-2xl rounded-bl-md max-w-[85%]",
          "bg-card text-foreground text-sm leading-relaxed",
          "border border-primary/30",
          "group-hover:bg-card/80 transition-colors"
        )}
        animate={{
          boxShadow: isAnimating
            ? "0 0 12px hsl(var(--primary) / 0.2)"
            : "0 0 0 transparent",
        }}
      >
        <TypewriterText
          text={text}
          isAnimating={isAnimating}
          onComplete={onAnimationComplete}
          speed={18}
        />
      </motion.div>
    </motion.button>
  );
}

// Expandable topic cards - larger with descriptions
function TopicCards({
  currentScenarioIndex,
  onCardClick,
}: {
  currentScenarioIndex: number;
  onCardClick: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {scenarios.map((scenario, index) => {
        const topic = topics.find((t) => t.id === scenario.topicId)!;
        const isActive = index === currentScenarioIndex;
        const Icon = topic.icon;

        return (
          <motion.button
            key={scenario.id}
            onClick={() => onCardClick(index)}
            className={cn(
              "relative flex flex-col items-start p-4 rounded-xl transition-all duration-300 text-left",
              "min-h-[100px]",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:border-primary/50"
            )}
            animate={{
              boxShadow: isActive
                ? "0 0 24px hsl(var(--primary) / 0.35)"
                : "none",
            }}
            layout
          >
            {/* Icon and label row */}
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                "p-1.5 rounded-lg",
                isActive ? "bg-primary-foreground/20" : "bg-primary/10"
              )}>
                <Icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-primary-foreground" : "text-primary"
                )} />
              </div>
              <span className="font-semibold text-sm">{topic.label}</span>
            </div>

            {/* Description - always visible but styled differently */}
            <p className={cn(
              "text-xs leading-relaxed",
              isActive ? "text-primary-foreground/90" : "text-muted-foreground"
            )}>
              {topic.description}
            </p>

            {/* Active indicator dot */}
            {isActive && (
              <motion.div
                className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-foreground"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// Group chat simulation
function GroupChatSimulation({
  onOpenChat,
  onTopicChange,
  isInView,
}: {
  onOpenChat: (message: string) => void;
  onTopicChange: (topicId: string) => void;
  isInView: boolean;
}) {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [currentlyAnimating, setCurrentlyAnimating] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentScenario = scenarios[currentScenarioIndex];
  const currentMessages = currentScenario.messages;

  // Notify parent of topic change
  useEffect(() => {
    onTopicChange(currentScenario.topicId);
  }, [currentScenario.topicId, onTopicChange]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Main auto-play logic
  useEffect(() => {
    if (!isInView || isPaused) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // If no messages visible yet, start showing the first one
    if (visibleMessages === 0 && currentlyAnimating === null) {
      timeoutRef.current = setTimeout(() => {
        setVisibleMessages(1);
        setCurrentlyAnimating(0);
      }, 500);
      return;
    }

    // If animation is done and we have more messages
    if (currentlyAnimating === null && visibleMessages > 0 && visibleMessages < currentMessages.length) {
      timeoutRef.current = setTimeout(() => {
        setVisibleMessages((v) => v + 1);
        setCurrentlyAnimating(visibleMessages);
      }, 600);
      return;
    }

    // If all messages shown and animation done, wait then go to next scenario
    if (currentlyAnimating === null && visibleMessages >= currentMessages.length) {
      timeoutRef.current = setTimeout(() => {
        setCurrentScenarioIndex((i) => (i + 1) % scenarios.length);
      }, 3000);
    }
  }, [isInView, isPaused, visibleMessages, currentlyAnimating, currentMessages.length]);

  // Reset when scenario changes
  useEffect(() => {
    setVisibleMessages(0);
    setCurrentlyAnimating(null);
  }, [currentScenarioIndex]);

  const handleAnimationComplete = useCallback(() => {
    setCurrentlyAnimating(null);
  }, []);

  const handleBubbleClick = useCallback(
    (text: string) => {
      setIsPaused(true);
      onOpenChat(text);
      setTimeout(() => setIsPaused(false), 30000);
    },
    [onOpenChat]
  );

  const handleCardClick = useCallback((index: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsPaused(true);
    setCurrentScenarioIndex(index);
    setVisibleMessages(0);
    setCurrentlyAnimating(null);
    setTimeout(() => setIsPaused(false), 8000);
  }, []);

  const getCoOwner = (id: string) => coOwners.find((c) => c.id === id)!;

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll within container only (not the page)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [visibleMessages]);

  return (
    <div className="flex flex-col">
      {/* Chat container - fixed height with scroll */}
      <div className="bg-background rounded-2xl border border-border p-4 h-[340px] flex flex-col">
        {/* Header - fixed at top */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border flex-shrink-0">
          <div className="flex -space-x-1.5">
            {coOwners.map((co) => (
              <CoOwnerAvatar key={co.id} coOwner={co} size="sm" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <HomiAvatar isTyping={currentlyAnimating !== null && currentMessages[currentlyAnimating]?.sender === "homi"} size="sm" />
            <div>
              <p className="text-sm font-semibold text-foreground">Group Chat</p>
              <p className="text-xs text-muted-foreground">3 co-owners + Homi</p>
            </div>
          </div>
        </div>

        {/* Messages - scrollable area */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
          <AnimatePresence mode="sync">
            {currentMessages.slice(0, visibleMessages).map((msg, idx) => {
              const isHomi = msg.sender === "homi";
              const coOwner = !isHomi ? getCoOwner(msg.sender) : null;
              const isCurrentlyAnimating = currentlyAnimating === idx;

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
                      isAnimating={isCurrentlyAnimating}
                      onAnimationComplete={handleAnimationComplete}
                    />
                  ) : (
                    <CoOwnerBubble
                      coOwner={coOwner!}
                      text={msg.text}
                      onClick={() => handleBubbleClick(msg.text)}
                      isAnimating={isCurrentlyAnimating}
                      onAnimationComplete={handleAnimationComplete}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Topic cards below chat */}
      <div className="mt-6">
        <TopicCards
          currentScenarioIndex={currentScenarioIndex}
          onCardClick={handleCardClick}
        />
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-muted-foreground mt-4">
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
  const [, setActiveTopic] = useState("finances");

  const handleTopicChange = useCallback((topicId: string) => {
    setActiveTopic(topicId);
  }, []);

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-secondary/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-10"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
            Introducing
          </p>
          <h2 className="font-heading text-[1.4rem] font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl mb-4 whitespace-nowrap">
            AI-Powered <span className="inline-block">🏡</span> Co-Ownership
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            One AI assistant that keeps every co-owner informed, aligned, and on track.
          </p>
        </motion.div>

        {/* Chat simulation - centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GroupChatSimulation
            onOpenChat={onOpenChat}
            onTopicChange={handleTopicChange}
            isInView={isInView}
          />
        </motion.div>
      </div>
    </section>
  );
}
