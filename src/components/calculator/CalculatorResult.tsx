"use client";

import { motion } from "framer-motion";
import { Home, Users, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/calculator";
import type { CalculatorResult as CalculatorResultType } from "@/types";
import Link from "next/link";

interface CalculatorResultProps {
  result: CalculatorResultType;
  numberOfCoBuyers: number;
  cityName: string;
}

export function CalculatorResult({
  result,
  numberOfCoBuyers,
  cityName,
}: CalculatorResultProps) {
  const { soloMax, groupMax, unlockAmount } = result;

  // Calculate percentage increase
  const percentageIncrease =
    soloMax > 0 ? Math.round(((groupMax - soloMax) / soloMax) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Unlock highlight */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-primary/5 border-2 border-primary rounded-2xl p-6 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-primary mb-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold text-sm uppercase tracking-wide">
            You could unlock
          </span>
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="font-heading text-4xl md:text-5xl font-bold text-primary">
          {formatCurrency(unlockAmount)}
        </p>
        <p className="text-muted-foreground mt-2">
          in additional buying power with {numberOfCoBuyers} co-buyers
        </p>
      </motion.div>

      {/* Comparison cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Solo */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
              <Home className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="font-medium text-muted-foreground">
              Buying alone
            </span>
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">
            {formatCurrency(soloMax)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Maximum home price
          </p>
        </div>

        {/* Together */}
        <div className="bg-card rounded-xl border-2 border-primary p-5 relative overflow-hidden">
          {/* Badge */}
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
            +{percentageIncrease}%
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium text-primary">
              Buying with {numberOfCoBuyers - 1} other{numberOfCoBuyers > 2 ? "s" : ""}
            </span>
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">
            {formatCurrency(groupMax)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Maximum home price
          </p>
        </div>
      </div>

      {/* What this means */}
      <div className="bg-secondary/50 rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-2">
          What this means for you
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {soloMax > 0 ? (
            <>
              In {cityName || "your area"}, buying alone might limit you to smaller
              properties or less desirable neighborhoods. With {numberOfCoBuyers}{" "}
              co-buyers sharing costs equally, you could afford a{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(groupMax)}
              </span>{" "}
              home—potentially getting the space, location, or features you
              really want.
            </>
          ) : (
            <>
              Based on your current income and savings, you might need to save
              more for a down payment or reduce existing debts before buying.
              Co-ownership can still help when you&apos;re ready—pooling resources
              with {numberOfCoBuyers - 1} co-buyer{numberOfCoBuyers > 2 ? "s" : ""}{" "}
              significantly expands your options.
            </>
          )}
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button className="rounded-full flex-1" asChild>
          <Link href="/how-it-works">
            Learn How It Works
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" className="rounded-full flex-1" asChild>
          <Link href="/assessment">Take Readiness Assessment</Link>
        </Button>
      </div>
    </div>
  );
}
