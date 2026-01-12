"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Share2, Save, Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSmartCalculator } from "@/hooks/useSmartCalculator";

export function ResultActions() {
  const { state } = useSmartCalculator();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate shareable URL (simplified - will be enhanced)
  const generateShareUrl = () => {
    const { primaryBuyer, coBuyers, coBuyerMode, targetCity } = state;

    const shareData = {
      v: 1,
      p: {
        i: primaryBuyer.annualIncome,
        s: primaryBuyer.savings,
        d: primaryBuyer.monthlyDebts,
      },
      m: coBuyerMode === "similar" ? "s" : "d",
      c: coBuyers.map((cb) => ({
        i: cb.annualIncome,
        s: cb.savings,
        d: cb.monthlyDebts,
      })),
      y: targetCity,
    };

    const encoded = btoa(JSON.stringify(shareData))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    return `${window.location.origin}/calculator?s=${encoded}`;
  };

  const handleCopyLink = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    const url = generateShareUrl();
    const { results } = state;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Co-Ownership Calculator Results",
          text: `I could afford ${formatCurrency(results?.groupMax ?? 0)} with co-buyers! Check out what you could afford.`,
          url,
        });
      } catch {
        // User cancelled or share failed, show modal instead
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Share Button */}
        <Button
          onClick={handleShare}
          variant="outline"
          className="flex-1 rounded-full gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share Results
        </Button>

        {/* Save Button */}
        <Button className="flex-1 rounded-full gap-2">
          <Save className="h-4 w-4" />
          Save Results
        </Button>
      </div>

      {/* Share Modal - rendered via portal to avoid layout issues */}
      {mounted && showShareModal && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowShareModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-2xl p-6 max-w-md w-full shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              Share Your Results
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Send this link to a potential co-buyer to show them what you could
              afford together.
            </p>

            {/* Copy link button */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between p-3 bg-muted rounded-lg mb-4 hover:bg-muted/80 transition-colors"
            >
              <span className="text-sm text-foreground truncate pr-4">
                {generateShareUrl().slice(0, 40)}...
              </span>
              {copied ? (
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </button>

            {copied && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-green-600 text-center mb-4"
              >
                Link copied to clipboard!
              </motion.p>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowShareModal(false)}
              >
                Close
              </Button>
              <Button className="flex-1" onClick={handleCopyLink}>
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
