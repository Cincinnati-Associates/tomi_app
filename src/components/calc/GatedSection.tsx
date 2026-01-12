"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
// Auth imports commented out until Supabase is configured
// import { Lock } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { useAuth } from '@/hooks/useAuth';
// import { SignupOverlay } from './SignupOverlay';

interface GatedSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function GatedSection({
  title,
  description,
  children,
  defaultExpanded = false,
}: GatedSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Auth disabled until Supabase is configured
  // const { isAuthenticated, isLoading } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _isAuthenticated = true; // Bypass auth for now
  const isLoading = false;

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className="bg-card/50 backdrop-blur-lg rounded-xl border border-border overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={toggleExpanded}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Lock icon hidden until auth is enabled
          {!isAuthenticated && !isLoading && (
            <div className="p-1.5 rounded-full bg-primary/10">
              <Lock className="w-4 h-4 text-primary" />
            </div>
          )}
          */}
          <div className="text-left">
            <h2 className="text-xl font-heading font-bold text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="relative">
              {/* Content - shown without blur since auth is bypassed */}
              <div className="p-6 pt-2">
                {children}
              </div>

              {/* Signup Overlay - disabled until auth is enabled
              {!isAuthenticated && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/95 via-background/80 to-background/60">
                  <SignupOverlay />
                </div>
              )}
              */}

              {/* Loading state */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
