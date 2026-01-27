"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnswerOption, HybridConfig } from "@/hooks/useAssessment";

interface HybridInputProps {
  options: AnswerOption[];
  hybridConfig: HybridConfig;
  selectedIndex: number | null;
  onSelect: (optionIndex: number, exactValue?: number | string) => void;
  disabled?: boolean;
}

// Format number as currency (without the $ sign since we show it separately)
function formatCurrencyValue(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Parse currency string to number
function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]+/g, "");
  return parseInt(cleaned, 10) || 0;
}

// Get the bucket index for a given numeric value
function getBucketForValue(value: number, options: AnswerOption[]): number {
  // Sort options by value descending to find the right bucket
  for (let i = 0; i < options.length; i++) {
    const optionValue = options[i].value;
    if (typeof optionValue === "number" && value >= optionValue) {
      return i;
    }
  }
  return options.length - 1; // Return last option (lowest bucket)
}

export function HybridInput({
  options,
  hybridConfig,
  selectedIndex,
  onSelect,
  disabled,
}: HybridInputProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [isManualMode, setIsManualMode] = useState(false);

  const isTextMode = hybridConfig.unit === "text";
  const isCurrencyMode = hybridConfig.unit === "currency" || hybridConfig.unit === "currency_monthly";
  const isMonthly = hybridConfig.unit === "currency_monthly";

  // Reset manual value when selection changes from outside
  useEffect(() => {
    if (selectedIndex === null) {
      setInputValue("");
      setIsManualMode(false);
    }
  }, [selectedIndex]);

  const handleChipSelect = useCallback(
    (index: number) => {
      if (disabled) return;
      setIsManualMode(false);
      setInputValue("");
      onSelect(index);
    },
    [disabled, onSelect]
  );

  const handleManualSubmit = useCallback(() => {
    if (disabled || !inputValue.trim()) return;

    if (isTextMode) {
      // For text input, always select first option (highest score) with the text value
      onSelect(0, inputValue.trim());
    } else {
      // For currency input
      const numericValue = parseCurrency(inputValue);
      if (numericValue <= 0) return;
      const bucketIndex = getBucketForValue(numericValue, options);
      onSelect(bucketIndex, numericValue);
    }
  }, [disabled, inputValue, isTextMode, options, onSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (isTextMode) {
      // For text mode, just store the value directly
      setInputValue(rawValue);
    } else {
      // For currency mode, format as number
      const numericOnly = rawValue.replace(/[^0-9]/g, "");
      if (numericOnly) {
        setInputValue(formatCurrencyValue(parseInt(numericOnly, 10)));
      } else {
        setInputValue("");
      }
    }
    setIsManualMode(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleManualSubmit();
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Chip options - 2x2 grid on mobile - compact */}
      <div className="grid grid-cols-2 gap-2">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index && !isManualMode;

          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => handleChipSelect(index)}
              disabled={disabled}
              className={cn(
                "relative flex items-center justify-center px-3 py-2.5 rounded-lg border-2",
                "text-xs sm:text-sm font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1",
                "min-h-[44px]",
                isSelected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-foreground/80 hover:border-primary/50 hover:bg-primary/5",
                disabled && !isSelected && "opacity-50 cursor-not-allowed"
              )}
              whileTap={!disabled ? { scale: 0.98 } : undefined}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5"
                >
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                </motion.div>
              )}

              <span className="text-center leading-tight pr-3">{option.text}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Divider - compact */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Manual input - compact */}
      <div className="relative">
        {/* Left icon - $ for currency, location pin for text */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {isCurrencyMode ? (
            <span className="text-muted-foreground font-medium text-sm">$</span>
          ) : (
            <MapPin className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        <input
          type="text"
          inputMode={isTextMode ? "text" : "numeric"}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim() && isManualMode) {
              handleManualSubmit();
            }
          }}
          placeholder={hybridConfig.placeholder}
          disabled={disabled}
          className={cn(
            "w-full py-3 rounded-lg border-2 bg-card",
            "text-sm font-medium placeholder:text-muted-foreground/60",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
            "transition-all duration-200",
            isCurrencyMode ? "pl-8" : "pl-10",
            isMonthly ? "pr-16" : "pr-3",
            isManualMode && inputValue
              ? "border-primary bg-primary/5"
              : "border-border",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Right suffix for monthly */}
        {isMonthly && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-xs text-muted-foreground">/month</span>
          </div>
        )}
      </div>

      {/* Centered Enter button below input - compact */}
      {isManualMode && inputValue.trim() && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            type="button"
            onClick={handleManualSubmit}
            disabled={disabled}
            className={cn(
              "px-6 py-2 rounded-lg bg-primary text-primary-foreground",
              "text-sm font-semibold",
              "hover:bg-primary/90 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            Enter
          </button>
        </motion.div>
      )}
    </div>
  );
}
