"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSmartCalculator } from "@/hooks/useSmartCalculator";
import { Users, User, DollarSign } from "lucide-react";

interface CoOwnerCardsProps {
  compact?: boolean;
}

export function CoOwnerCards({ compact = false }: CoOwnerCardsProps) {
  const { state, updateCoBuyer, setDownPayment, setMonthlyBudget } =
    useSmartCalculator();
  const { primaryBuyer, coBuyers } = state;

  // Calculate ownership percentages
  const allOwners = [primaryBuyer, ...coBuyers];
  const totalDownPayment = allOwners.reduce(
    (sum, owner) => sum + (owner.downPaymentContribution || 0),
    0
  );

  const getOwnershipPercent = (contribution: number) => {
    if (totalDownPayment === 0) return 100 / allOwners.length;
    return (contribution / totalDownPayment) * 100;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Contributions
          </h3>
        </div>

        {/* Primary buyer - compact */}
        <div className="bg-secondary/50 rounded-lg p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: primaryBuyer.color }}
            >
              {primaryBuyer.name.charAt(0)}
            </div>
            <span className="text-xs font-medium text-foreground">
              {primaryBuyer.name}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {getOwnershipPercent(primaryBuyer.downPaymentContribution).toFixed(
              0
            )}
            %
          </span>
        </div>

        {/* Co-buyers - compact */}
        {coBuyers.map((coBuyer) => (
          <div
            key={coBuyer.id}
            className="bg-secondary/50 rounded-lg p-2 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: coBuyer.color }}
              >
                {coBuyer.name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-foreground">
                {coBuyer.name}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {getOwnershipPercent(coBuyer.downPaymentContribution).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-heading font-semibold text-foreground">
          Co-Owner Contributions
        </h3>
      </div>

      <p className="text-xs text-muted-foreground">
        Adjust each person&apos;s down payment and monthly budget to see how
        ownership changes.
      </p>

      <AnimatePresence mode="popLayout">
        {/* Primary buyer card */}
        <motion.div
          key="primary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-card rounded-xl p-3 border border-border shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: primaryBuyer.color }}
            >
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {primaryBuyer.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {getOwnershipPercent(
                  primaryBuyer.downPaymentContribution
                ).toFixed(0)}
                % ownership
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Down Payment
              </label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="number"
                  value={primaryBuyer.downPaymentContribution || ""}
                  onChange={(e) =>
                    setDownPayment(parseInt(e.target.value) || 0)
                  }
                  placeholder="50,000"
                  className="w-full pl-6 pr-2 py-1.5 text-sm rounded-lg border border-border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Monthly Budget
              </label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="number"
                  value={primaryBuyer.monthlyBudget || ""}
                  onChange={(e) =>
                    setMonthlyBudget(parseInt(e.target.value) || 0)
                  }
                  placeholder="2,500"
                  className="w-full pl-6 pr-2 py-1.5 text-sm rounded-lg border border-border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Co-buyer cards */}
        {coBuyers.map((coBuyer, index) => (
          <motion.div
            key={coBuyer.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-3 border border-border shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: coBuyer.color }}
              >
                {coBuyer.name.charAt(0)}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={coBuyer.name}
                  onChange={(e) =>
                    updateCoBuyer(index, { name: e.target.value })
                  }
                  className="text-sm font-semibold text-foreground bg-transparent border-none outline-none focus:bg-secondary/30 rounded px-1 -ml-1"
                />
                <p className="text-xs text-muted-foreground">
                  {getOwnershipPercent(coBuyer.downPaymentContribution).toFixed(
                    0
                  )}
                  % ownership
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Down Payment
                </label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <input
                    type="number"
                    value={coBuyer.downPaymentContribution || ""}
                    onChange={(e) =>
                      updateCoBuyer(index, {
                        downPaymentContribution: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="50,000"
                    className="w-full pl-6 pr-2 py-1.5 text-sm rounded-lg border border-border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Monthly Budget
                </label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <input
                    type="number"
                    value={coBuyer.monthlyBudget || ""}
                    onChange={(e) =>
                      updateCoBuyer(index, {
                        monthlyBudget: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="2,500"
                    className="w-full pl-6 pr-2 py-1.5 text-sm rounded-lg border border-border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
