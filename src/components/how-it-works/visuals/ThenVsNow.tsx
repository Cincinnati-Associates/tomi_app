"use client";

import { motion } from "framer-motion";
import { FileText, Users, Clock, Sparkles, BarChart3, Shield } from "lucide-react";

interface ThenVsNowProps {
  props: {
    thenItems: { icon: string; text: string }[];
    nowItems: { icon: string; text: string }[];
  };
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  paperwork: FileText,
  lawyers: Users,
  time: Clock,
  ai: Sparkles,
  insights: BarChart3,
  protection: Shield,
};

export function ThenVsNow({ props }: ThenVsNowProps) {
  const { thenItems, nowItems } = props;

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Then column */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 bg-red-500/10 text-red-500 text-sm font-medium rounded-full">
              Then
            </span>
          </div>

          {thenItems.map((item, index) => {
            const Icon = ICON_MAP[item.icon] || FileText;
            return (
              <motion.div
                key={item.text}
                className="flex items-center gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 + 0.3 }}
              >
                <Icon className="h-5 w-5 text-red-500/70 flex-shrink-0" />
                <span className="text-sm text-muted-foreground line-through decoration-red-500/50">
                  {item.text}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Now column */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
              Now
            </span>
          </div>

          {nowItems.map((item, index) => {
            const Icon = ICON_MAP[item.icon] || Sparkles;
            return (
              <motion.div
                key={item.text}
                className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 + 0.5 }}
              >
                <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground font-medium">
                  {item.text}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Divider with arrow */}
      <motion.div
        className="flex items-center justify-center mt-6 gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <motion.div
          className="text-primary"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          →
        </motion.div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
      </motion.div>
    </div>
  );
}
