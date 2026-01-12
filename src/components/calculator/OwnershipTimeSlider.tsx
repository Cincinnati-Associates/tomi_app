"use client";

import { useSmartCalculator } from "@/hooks/useSmartCalculator";
import { AnimatedCounter } from "./AnimatedCounter";
import { Clock } from "lucide-react";

interface OwnershipTimeSliderProps {
  compact?: boolean;
}

export function OwnershipTimeSlider({ compact = false }: OwnershipTimeSliderProps) {
  const { state, setExitYear } = useSmartCalculator();
  const { selectedExitYear, results } = state;

  if (!results) return null;

  // Simplified equity calculation over time
  const homeValue = results.groupMax;
  const loanAmount = homeValue * 0.8;
  const annualAppreciation = 0.03; // 3% annual appreciation

  // Calculate equity at selected year
  const homeValueAtYear = homeValue * Math.pow(1 + annualAppreciation, selectedExitYear);

  // Simplified mortgage paydown (linear approximation)
  const yearlyPaydown = loanAmount / 30;
  const remainingLoan = Math.max(0, loanAmount - yearlyPaydown * selectedExitYear);

  const totalEquity = homeValueAtYear - remainingLoan;

  // Distribute equity based on ownership percentages
  const equityPerOwner = results.ownershipAtClose.map((split) => ({
    ...split,
    equityValue: totalEquity * (split.percentage / 100),
  }));

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Equity at Year {selectedExitYear}
          </h3>
        </div>

        {/* Year Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min={1}
            max={30}
            value={selectedExitYear}
            onChange={(e) => setExitYear(parseInt(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-primary
                       [&::-webkit-slider-thumb]:shadow-md
                       [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1</span>
            <span>15</span>
            <span>30 yrs</span>
          </div>
        </div>

        {/* Compact Summary */}
        <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Total Equity</span>
            <span className="font-bold text-primary">
              <AnimatedCounter value={Math.round(totalEquity)} prefix="$" />
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Your Share</span>
            <span className="font-semibold text-foreground">
              <AnimatedCounter value={Math.round(equityPerOwner[0]?.equityValue ?? 0)} prefix="$" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-heading font-semibold text-foreground">
          Equity Over Time
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        See how your equity grows as you pay down the mortgage and the home appreciates
      </p>

      {/* Year Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Year</span>
          <span className="text-sm font-semibold text-foreground">
            {selectedExitYear} {selectedExitYear === 1 ? "year" : "years"}
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={30}
          value={selectedExitYear}
          onChange={(e) => setExitYear(parseInt(e.target.value))}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-primary
                     [&::-webkit-slider-thumb]:shadow-md
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-110"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 yr</span>
          <span>15 yrs</span>
          <span>30 yrs</span>
        </div>
      </div>

      {/* Equity Summary */}
      <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Home Value</span>
          <span className="font-medium text-foreground">
            <AnimatedCounter value={Math.round(homeValueAtYear)} prefix="$" />
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Remaining Mortgage</span>
          <span className="font-medium text-foreground">
            <AnimatedCounter value={Math.round(remainingLoan)} prefix="$" />
          </span>
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">Total Equity</span>
            <span className="font-bold text-primary text-lg">
              <AnimatedCounter value={Math.round(totalEquity)} prefix="$" />
            </span>
          </div>
        </div>
      </div>

      {/* Per-owner equity breakdown */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Your share</p>
        {equityPerOwner.map((owner) => (
          <div
            key={owner.buyerId}
            className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: owner.color }}
              />
              <span className="text-sm text-foreground">{owner.buyerName}</span>
              <span className="text-xs text-muted-foreground">
                ({owner.percentage.toFixed(0)}%)
              </span>
            </div>
            <span className="font-semibold text-foreground">
              <AnimatedCounter
                value={Math.round(owner.equityValue)}
                prefix="$"
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
