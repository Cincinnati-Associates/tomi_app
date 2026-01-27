"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStoryProgress } from "@/hooks/useStoryProgress";
import { StoryVisual } from "./StoryVisual";
import { StoryChat } from "./StoryChat";
import { CHAPTER_TITLES } from "@/content/story-steps";
import { cn } from "@/lib/utils";
import { HomiChat } from "@/components/shared/HomiChat";

export function HowItWorksPage() {
  const storyProgress = useStoryProgress();
  const { currentStep, chapter, totalChapters } = storyProgress;
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 overflow-hidden bg-background pt-16 md:pt-20">
        {/* Desktop: Split-screen layout */}
        <div className="hidden md:block h-full">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6 h-full">
            <div className="grid grid-cols-2 gap-0 h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-lg border border-border">
              {/* Left Panel: Visual */}
              <div className="flex flex-col bg-gradient-to-br from-secondary/30 to-background overflow-hidden rounded-l-2xl">
                {/* Chapter Progress - Desktop */}
                <div className="px-6 py-4 border-b border-border bg-card/50">
                  <ChapterProgress
                    current={chapter}
                    total={totalChapters}
                    title={CHAPTER_TITLES[chapter]}
                  />
                </div>

                {/* Visual Content */}
                <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
                  <StoryVisual step={currentStep} />
                </div>
              </div>

              {/* Right Panel: Chat */}
              <div className="flex flex-col bg-card overflow-hidden rounded-r-2xl">
                <StoryChat
                  storyProgress={storyProgress}
                  onOpenHomiChat={handleOpenChat}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="md:hidden flex flex-col h-[calc(100vh-64px)] overflow-hidden">
          {/* Visual Panel - Top 2/3 */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-secondary/30 to-background overflow-hidden min-h-0">
            {/* Chapter Progress - Mobile */}
            <div className="px-4 py-3 border-b border-border bg-card/50 flex-shrink-0">
              <ChapterProgress
                current={chapter}
                total={totalChapters}
                title={CHAPTER_TITLES[chapter]}
                compact
              />
            </div>

            {/* Visual Content */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <StoryVisual step={currentStep} />
            </div>
          </div>

          {/* Chat Panel - Bottom 1/3 */}
          <div className="h-[35vh] flex-shrink-0 bg-card border-t border-border rounded-t-2xl shadow-lg overflow-hidden">
            <StoryChat
              storyProgress={storyProgress}
              onOpenHomiChat={handleOpenChat}
              compact
            />
          </div>
        </div>
      </div>

      {/* Homi Chat Modal */}
      <HomiChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

// Chapter progress indicator
function ChapterProgress({
  current,
  total,
  title,
  compact = false,
}: {
  current: number;
  total: number;
  title: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", compact && "gap-2")}>
      {/* Dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            key={i}
            className={cn(
              "rounded-full transition-colors",
              compact ? "w-2 h-2" : "w-2.5 h-2.5",
              i + 1 === current
                ? "bg-primary"
                : i + 1 < current
                ? "bg-primary/50"
                : "bg-muted-foreground/30"
            )}
            initial={false}
            animate={i + 1 === current ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Chapter title */}
      <span
        className={cn(
          "font-medium text-muted-foreground",
          compact ? "text-xs" : "text-sm"
        )}
      >
        Chapter {current}: {title}
      </span>
    </div>
  );
}
