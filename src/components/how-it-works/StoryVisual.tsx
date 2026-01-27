"use client";

import { AnimatePresence, motion } from "framer-motion";
import { StoryStep, VisualType } from "@/content/story-steps";
import { AnimatedStat } from "./visuals/AnimatedStat";
import { ComparisonBars } from "./visuals/ComparisonBars";
import { BarrierIcons } from "./visuals/BarrierIcons";
import { WorldMap } from "./visuals/WorldMap";
import { CultureCarousel } from "./visuals/CultureCarousel";
import { Timeline } from "./visuals/Timeline";
import { Calligraphy } from "./visuals/Calligraphy";
import { ThenVsNow } from "./visuals/ThenVsNow";
import { PillarCards } from "./visuals/PillarCards";
import { BuyingPowerPreview } from "./visuals/BuyingPowerPreview";
import { GlowingCTA } from "./visuals/GlowingCTA";

interface StoryVisualProps {
  step: StoryStep;
}

// Map visual types to components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VISUAL_COMPONENTS: Record<VisualType, React.ComponentType<{ props: any }>> = {
  "animated-stat": AnimatedStat,
  "comparison-bars": ComparisonBars,
  "barrier-icons": BarrierIcons,
  "world-map": WorldMap,
  "culture-carousel": CultureCarousel,
  "timeline": Timeline,
  "calligraphy": Calligraphy,
  "then-vs-now": ThenVsNow,
  "pillar-cards": PillarCards,
  "buying-power-preview": BuyingPowerPreview,
  "glowing-cta": GlowingCTA,
};

export function StoryVisual({ step }: StoryVisualProps) {
  const VisualComponent = VISUAL_COMPONENTS[step.visual.type];

  if (!VisualComponent) {
    return (
      <div className="text-muted-foreground text-center">
        Visual: {step.visual.type}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full flex items-center justify-center"
      >
        <VisualComponent props={step.visual.props} />
      </motion.div>
    </AnimatePresence>
  );
}
