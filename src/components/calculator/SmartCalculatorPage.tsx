"use client";

import { useState, createContext, useContext } from "react";
import { motion } from "framer-motion";
import { SmartCalculatorProvider } from "@/hooks/useSmartCalculator";
import { CalculatorChat } from "./CalculatorChat";
import { LiveCalculatorPanel } from "./LiveCalculatorPanel";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Context for intro animation state
interface IntroAnimationContextValue {
  introComplete: boolean;
  setIntroComplete: (complete: boolean) => void;
}

const IntroAnimationContext = createContext<IntroAnimationContextValue>({
  introComplete: false,
  setIntroComplete: () => {},
});

export function useIntroAnimation() {
  return useContext(IntroAnimationContext);
}

export function SmartCalculatorPage() {
  const [isMobilePanelExpanded, setIsMobilePanelExpanded] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <SmartCalculatorProvider>
      <IntroAnimationContext.Provider value={{ introComplete, setIntroComplete }}>
      <div className="h-screen overflow-hidden bg-background pt-20 md:pt-24">
        {/* Desktop: Split-screen layout with padding */}
        <div className="hidden md:block h-full">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6 h-full">
            <div className="grid grid-cols-2 gap-0 h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-lg border border-border">
              {/* Left Panel: Chat */}
              <div className="flex flex-col bg-card rounded-l-2xl overflow-hidden">
                <CalculatorChat />
              </div>

              {/* Right Panel: Live Calculator */}
              <div className="flex flex-col bg-secondary/30 overflow-y-auto rounded-r-2xl">
                <LiveCalculatorPanel />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Stacked layout with collapsible panel */}
        <div className="md:hidden flex flex-col h-[calc(100vh-80px)]">
          {/* Chat area - takes remaining space */}
          <div
            className={cn(
              "flex-1 flex flex-col bg-card transition-all duration-300",
              isMobilePanelExpanded ? "h-[30vh]" : "flex-1"
            )}
          >
            <CalculatorChat />
          </div>

          {/* Collapsible Calculator Panel */}
          <motion.div
            initial={false}
            animate={{
              height: isMobilePanelExpanded ? "70vh" : "80px",
            }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-secondary/30 border-t border-border shadow-lg rounded-t-2xl overflow-hidden"
          >
            {/* Drag handle / Summary bar */}
            <button
              onClick={() => setIsMobilePanelExpanded(!isMobilePanelExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between bg-card border-b border-border"
            >
              <MobileCalculatorSummary />
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">
                  {isMobilePanelExpanded ? "Collapse" : "Expand"}
                </span>
                {isMobilePanelExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronUp className="h-5 w-5" />
                )}
              </div>
            </button>

            {/* Calculator content (visible when expanded) */}
            <div
              className={cn(
                "overflow-y-auto",
                isMobilePanelExpanded ? "h-[calc(70vh-60px)]" : "h-0"
              )}
            >
              <LiveCalculatorPanel />
            </div>
          </motion.div>
        </div>
      </div>
      </IntroAnimationContext.Provider>
    </SmartCalculatorProvider>
  );
}

// Mini summary shown in collapsed mobile panel
function MobileCalculatorSummary() {
  // This will use useSmartCalculator to show live values
  // Placeholder for now - will be enhanced
  return (
    <div className="flex items-center gap-4">
      <div className="flex -space-x-2">
        {/* Co-buyer avatars (mini) */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium">
          Y
        </div>
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-medium">
          +1
        </div>
      </div>
      <div className="text-left">
        <p className="text-sm font-semibold text-foreground">$---,---</p>
        <p className="text-xs text-muted-foreground">Buying power</p>
      </div>
    </div>
  );
}
