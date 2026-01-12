"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculateAffordability, cities } from "@/lib/calculator";
import { CalculatorResult } from "./CalculatorResult";
import { cn } from "@/lib/utils";
import type { CalculatorInputs } from "@/types";

export function AffordabilityCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    annualIncome: 75000,
    savings: 50000,
    monthlyDebts: 500,
    targetCity: "other",
    numberOfCoBuyers: 2,
  });

  const [showResults, setShowResults] = useState(false);

  const result = useMemo(() => calculateAffordability(inputs), [inputs]);

  const handleInputChange = (field: keyof CalculatorInputs, value: string | number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    if (showResults) setShowResults(false);
  };

  const handleCalculate = () => {
    setShowResults(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
        <div className="space-y-6">
          {/* Annual Income */}
          <div>
            <label
              htmlFor="annualIncome"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Your annual income (before taxes)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="annualIncome"
                type="number"
                value={inputs.annualIncome}
                onChange={(e) =>
                  handleInputChange("annualIncome", parseInt(e.target.value) || 0)
                }
                className="pl-7"
                placeholder="75000"
              />
            </div>
          </div>

          {/* Savings */}
          <div>
            <label
              htmlFor="savings"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Available savings for down payment
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="savings"
                type="number"
                value={inputs.savings}
                onChange={(e) =>
                  handleInputChange("savings", parseInt(e.target.value) || 0)
                }
                className="pl-7"
                placeholder="50000"
              />
            </div>
          </div>

          {/* Monthly Debts */}
          <div>
            <label
              htmlFor="monthlyDebts"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Monthly debt payments (car, student loans, credit cards)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="monthlyDebts"
                type="number"
                value={inputs.monthlyDebts}
                onChange={(e) =>
                  handleInputChange("monthlyDebts", parseInt(e.target.value) || 0)
                }
                className="pl-7"
                placeholder="500"
              />
            </div>
          </div>

          {/* Target City */}
          <div>
            <label
              htmlFor="targetCity"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Where are you looking to buy?
            </label>
            <select
              id="targetCity"
              value={inputs.targetCity}
              onChange={(e) => handleInputChange("targetCity", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {cities.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>

          {/* Number of Co-Buyers */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              How many people will co-own together (including you)?
            </label>
            <div className="flex gap-2">
              {([2, 3, 4] as const).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleInputChange("numberOfCoBuyers", num)}
                  className={cn(
                    "flex-1 py-3 rounded-lg border-2 font-medium transition-all",
                    inputs.numberOfCoBuyers === num
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {num} people
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={handleCalculate}
            size="lg"
            className="w-full rounded-full"
          >
            Calculate Your Buying Power
          </Button>
        </div>
      </div>

      {/* Results */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <CalculatorResult
            result={result}
            numberOfCoBuyers={inputs.numberOfCoBuyers}
            cityName={
              cities.find((c) => c.value === inputs.targetCity)?.label || ""
            }
          />
        </motion.div>
      )}

      {/* Disclaimer */}
      <p className="mt-6 text-xs text-muted-foreground text-center">
        *This is an estimate based on typical lending guidelines (43% DTI, 20%
        down payment, 7% interest rate). Actual affordability may vary based on
        credit score, lender requirements, and other factors.
      </p>
    </div>
  );
}
