"use client";

import { motion } from "framer-motion";
import { Bot, FileText, BarChart3 } from "lucide-react";

interface Pillar {
  id: string;
  icon: "ai" | "agreements" | "insights";
  title: string;
  description: string;
}

interface PillarCardsProps {
  props: {
    pillars: Pillar[];
  };
}

const ICON_MAP = {
  ai: Bot,
  agreements: FileText,
  insights: BarChart3,
};

const ICON_COLORS = {
  ai: "text-blue-500 bg-blue-500/10",
  agreements: "text-green-500 bg-green-500/10",
  insights: "text-purple-500 bg-purple-500/10",
};

export function PillarCards({ props }: PillarCardsProps) {
  const { pillars } = props;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="space-y-4">
        {pillars.map((pillar, index) => {
          const Icon = ICON_MAP[pillar.icon];
          const colorClass = ICON_COLORS[pillar.icon];

          return (
            <motion.div
              key={pillar.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: index * 0.3,
                duration: 0.5,
                type: "spring",
                stiffness: 100,
              }}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className={`p-3 rounded-xl ${colorClass}`}
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.3 + 0.2,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </motion.div>
                <div className="flex-1">
                  <motion.h4
                    className="font-heading font-semibold text-foreground"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.3 + 0.3 }}
                  >
                    {pillar.title}
                  </motion.h4>
                  <motion.p
                    className="text-sm text-muted-foreground mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.3 + 0.4 }}
                  >
                    {pillar.description}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Connecting dots decoration */}
      <motion.div
        className="flex justify-center gap-2 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: pillars.length * 0.3 + 0.5 }}
      >
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.id}
            className="w-2 h-2 rounded-full bg-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.3 + 0.6 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
