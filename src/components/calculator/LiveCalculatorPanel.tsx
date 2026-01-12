"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSmartCalculator } from "@/hooks/useSmartCalculator";
import { useIntroAnimation } from "./SmartCalculatorPage";
import { CoBuyerAvatars } from "./CoBuyerAvatars";
import { BuyingPowerComparison } from "./BuyingPowerComparison";
import { AnimatedCounter } from "./AnimatedCounter";
import { OwnershipPieChart } from "./OwnershipPieChart";
import { OwnershipTimeSlider } from "./OwnershipTimeSlider";
import { ResultActions } from "./ResultActions";
import { CoOwnerCards } from "./CoOwnerCards";
import { TrendingUp, Home, Users } from "lucide-react";

// Random home values for the intro animation
const INTRO_VALUES = [425000, 680000, 320000, 550000, 780000, 410000, 620000, 0];
const INTRO_DURATION = 3000; // Total intro animation time in ms

export function LiveCalculatorPanel() {
  const { state } = useSmartCalculator();
  const { results, coBuyers, primaryBuyer, hasCalculated } = state;
  const { introComplete, setIntroComplete } = useIntroAnimation();

  const [introValue, setIntroValue] = useState(INTRO_VALUES[0]);
  const [isPlayingIntro, setIsPlayingIntro] = useState(true);
  const introTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Play intro animation on mount
  useEffect(() => {
    if (introComplete) {
      setIsPlayingIntro(false);
      return;
    }

    let currentIndex = 0;
    const intervalTime = INTRO_DURATION / INTRO_VALUES.length;

    const playNextValue = () => {
      currentIndex++;
      if (currentIndex < INTRO_VALUES.length) {
        setIntroValue(INTRO_VALUES[currentIndex]);
        introTimeoutRef.current = setTimeout(playNextValue, intervalTime);
      } else {
        // Animation complete
        setIsPlayingIntro(false);
        setIntroComplete(true);
      }
    };

    introTimeoutRef.current = setTimeout(playNextValue, intervalTime);

    return () => {
      if (introTimeoutRef.current) {
        clearTimeout(introTimeoutRef.current);
      }
    };
  }, [introComplete, setIntroComplete]);

  const hasData =
    primaryBuyer.annualIncome > 0 || primaryBuyer.downPaymentContribution > 0;
  const showCoOwnerCards =
    primaryBuyer.downPaymentContribution > 0 || primaryBuyer.monthlyBudget > 0;

  // Use intro value during animation, then switch to real value
  const displayValue = isPlayingIntro ? introValue : (results?.groupMax ?? 0);

  return (
    <div className="p-4 md:p-5 space-y-4 h-full overflow-y-auto">
      {/* Header + Avatars Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Your Buying Power
          </h2>
          <p className="text-muted-foreground text-xs">
            Co-ownership multiplies what you can afford
          </p>
        </div>
        <CoBuyerAvatars
          primaryBuyer={primaryBuyer}
          coBuyers={coBuyers}
          size="md"
        />
      </div>

      {/* Main Numbers Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: hasData ? 1 : 0.5, y: 0 }}
        className="bg-card rounded-xl p-4 shadow-sm border border-border"
      >
        {/* Group buying power - Primary number */}
        <div className="text-center mb-3">
          <p className="text-xs text-muted-foreground mb-1">Together you could afford</p>
          <div className="flex items-center justify-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <AnimatedCounter
              value={displayValue}
              className="text-3xl font-bold text-foreground"
              prefix="$"
            />
          </div>
        </div>

        {/* Unlock amount badge */}
        {results && results.unlockAmount > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="flex justify-center mb-3"
          >
            <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
              <TrendingUp className="h-3 w-3" />
              <span className="font-semibold">
                +<AnimatedCounter value={results.unlockAmount} prefix="$" /> unlocked
              </span>
            </div>
          </motion.div>
        )}

        {/* Before/After Comparison */}
        <BuyingPowerComparison
          soloMax={results?.soloMax ?? 0}
          groupMax={results?.groupMax ?? 0}
        />
      </motion.div>

      {/* Ownership + Time Slider - Side by side on larger screens */}
      {hasCalculated && results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Ownership Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-4 shadow-sm border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Ownership Split
              </h3>
            </div>
            <OwnershipPieChart splits={results.ownershipAtClose} size={140} />
          </motion.div>

          {/* Time Slider for Equity Evolution */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl p-4 shadow-sm border border-border"
          >
            <OwnershipTimeSlider compact />
          </motion.div>
        </div>
      )}

      {/* Co-Owner Cards - Shows when user has entered their contributions */}
      <AnimatePresence>
        {showCoOwnerCards && !hasCalculated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-xl p-4 shadow-sm border border-border"
          >
            <CoOwnerCards />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!hasData && !showCoOwnerCards && (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Home className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            Chat with Homi to see your buying power
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {hasCalculated && results && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ResultActions />
        </motion.div>
      )}
    </div>
  );
}
