"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import posthog from "posthog-js";
import { cn } from "@/lib/utils";
import { HomiChat } from "@/components/shared/HomiChat";
import { PageIntro } from "@/components/shared/PageIntro";

// Frame components
import { Frame1Together } from "./frames/Frame1Together";
import { Frame2WorldKnows } from "./frames/Frame2WorldKnows";
import { Frame3AmericanDream } from "./frames/Frame3AmericanDream";
import { Frame4MathStopped } from "./frames/Frame4MathStopped";
import { Frame5Technology } from "./frames/Frame5Technology";
import { Frame6ThisIsTomi } from "./frames/Frame6ThisIsTomi";
import { Frame7YourTurn } from "./frames/Frame7YourTurn";

// Custom hook to get frame progress for each frame index
function useFrameProgress(
  scrollYProgress: MotionValue<number>,
  frameIndex: number,
  totalFrames: number
): MotionValue<number> {
  const frameStart = frameIndex / totalFrames;
  const frameEnd = (frameIndex + 1) / totalFrames;

  return useTransform(scrollYProgress, [frameStart, frameEnd], [0, 1]);
}

const FRAME_NAMES = [
  "We've Always Been Together",
  "The World Knows Something We Forgot",
  "The American Dream",
  "The Math Stopped Working",
  "Technology Changes Everything",
  "This Is Tomi",
  "Your Turn",
];

const TOTAL_FRAMES = 7;

interface FrameProgressProps {
  currentFrame: number;
  totalFrames: number;
  onFrameClick?: (frame: number) => void;
}

function FrameProgress({ currentFrame, totalFrames, onFrameClick }: FrameProgressProps) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3">
      {Array.from({ length: totalFrames }, (_, i) => (
        <button
          key={i}
          onClick={() => onFrameClick?.(i)}
          className={cn(
            "w-3 h-3 rounded-full transition-all duration-300 border-2",
            i === currentFrame
              ? "bg-primary border-primary scale-125"
              : i < currentFrame
              ? "bg-primary/50 border-primary/50"
              : "bg-transparent border-muted-foreground/40 hover:border-primary/60"
          )}
          aria-label={`Go to frame ${i + 1}: ${FRAME_NAMES[i]}`}
        />
      ))}
    </div>
  );
}

// Mobile progress bar
function MobileProgress({ currentFrame, totalFrames }: { currentFrame: number; totalFrames: number }) {
  const progress = ((currentFrame + 1) / totalFrames) * 100;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 md:hidden px-4 py-2 bg-background/80 backdrop-blur-sm">
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1 text-center">
        {currentFrame + 1} / {totalFrames}
      </p>
    </div>
  );
}

interface FrameWrapperProps {
  children: React.ReactNode;
  index: number;
  scrollYProgress: MotionValue<number>;
  isActive: boolean;
}

function FrameWrapper({ children, index, scrollYProgress, isActive }: FrameWrapperProps) {
  const frameStart = index / TOTAL_FRAMES;
  const frameEnd = (index + 1) / TOTAL_FRAMES;
  const frameMid = (frameStart + frameEnd) / 2;

  const opacity = useTransform(
    scrollYProgress,
    [
      frameStart,
      frameStart + 0.02,
      frameMid,
      frameEnd - 0.02,
      frameEnd,
    ],
    index === TOTAL_FRAMES - 1
      ? [0, 1, 1, 1, 1] // Last frame stays visible
      : [0, 1, 1, 1, 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [frameStart, frameStart + 0.03, frameMid, frameEnd - 0.03, frameEnd],
    index === TOTAL_FRAMES - 1
      ? [0.95, 1, 1, 1, 1]
      : [0.95, 1, 1, 1, 0.95]
  );

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ opacity, scale }}
      aria-hidden={!isActive}
    >
      {children}
    </motion.div>
  );
}

export function CoOwnershipHistoryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const trackedFrames = useRef<Set<number>>(new Set());

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Track current frame based on scroll
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      const frame = Math.min(
        Math.floor(value * TOTAL_FRAMES),
        TOTAL_FRAMES - 1
      );
      setCurrentFrame(frame);
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  // Track frame views with PostHog
  useEffect(() => {
    if (!trackedFrames.current.has(currentFrame)) {
      trackedFrames.current.add(currentFrame);
      posthog.capture("co_ownership_history_frame_viewed", {
        frame: currentFrame + 1,
        frame_name: FRAME_NAMES[currentFrame],
      });
    }
  }, [currentFrame]);

  const handleFrameClick = useCallback((frameIndex: number) => {
    if (containerRef.current) {
      const scrollHeight = containerRef.current.scrollHeight - window.innerHeight;
      const targetScroll = (frameIndex / TOTAL_FRAMES) * scrollHeight;
      window.scrollTo({
        top: containerRef.current.offsetTop + targetScroll,
        behavior: "smooth",
      });
    }
  }, []);

  const handleOpenChat = useCallback(() => {
    posthog.capture("co_ownership_history_cta_clicked", { cta_type: "chat" });
    setIsChatOpen(true);
  }, []);

  const handleRestart = useCallback(() => {
    posthog.capture("co_ownership_history_cta_clicked", { cta_type: "restart" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAssessmentClick = useCallback(() => {
    posthog.capture("co_ownership_history_cta_clicked", { cta_type: "assessment" });
  }, []);

  // Get frame progress for each frame using our custom hook
  const frame0Progress = useFrameProgress(scrollYProgress, 0, TOTAL_FRAMES);
  const frame1Progress = useFrameProgress(scrollYProgress, 1, TOTAL_FRAMES);
  const frame2Progress = useFrameProgress(scrollYProgress, 2, TOTAL_FRAMES);
  const frame3Progress = useFrameProgress(scrollYProgress, 3, TOTAL_FRAMES);
  const frame4Progress = useFrameProgress(scrollYProgress, 4, TOTAL_FRAMES);
  const frame5Progress = useFrameProgress(scrollYProgress, 5, TOTAL_FRAMES);

  return (
    <>
      <PageIntro
        pageId="co-ownership-history"
        title="The Story of Co-Ownership"
        description="An interactive visual journey through 300,000 years of humans owning homes together."
        bullets={[
          "7 illustrated chapters",
          "Scroll to explore",
          "See how we got here",
        ]}
        ctaText="Begin the Story"
      />

      {/* Desktop progress indicator */}
      <FrameProgress
        currentFrame={currentFrame}
        totalFrames={TOTAL_FRAMES}
        onFrameClick={handleFrameClick}
      />

      {/* Mobile progress bar */}
      <MobileProgress currentFrame={currentFrame} totalFrames={TOTAL_FRAMES} />

      {/* Main scrollable container */}
      <div
        ref={containerRef}
        className="relative bg-background"
        style={{ height: `${(TOTAL_FRAMES + 1) * 120}vh` }}
      >
        {/* Sticky viewport */}
        <div className="sticky top-0 h-screen overflow-hidden pt-16 md:pt-20">
          {/* Frame 1 */}
          <FrameWrapper
            index={0}
            scrollYProgress={scrollYProgress}
            isActive={currentFrame === 0}
          >
            <Frame1Together progress={frame0Progress} />
          </FrameWrapper>

          {/* Frame 2 */}
          <FrameWrapper
            index={1}
            scrollYProgress={scrollYProgress}
            isActive={currentFrame === 1}
          >
            <Frame2WorldKnows progress={frame1Progress} isActive={currentFrame === 1} />
          </FrameWrapper>

          {/* Frame 3 */}
          <FrameWrapper
            index={2}
            scrollYProgress={scrollYProgress}
            isActive={currentFrame === 2}
          >
            <Frame3AmericanDream progress={frame2Progress} />
          </FrameWrapper>

          {/* Frame 4 */}
          <FrameWrapper
            index={3}
            scrollYProgress={scrollYProgress}
            isActive={currentFrame === 3}
          >
            <Frame4MathStopped progress={frame3Progress} isActive={currentFrame === 3} />
          </FrameWrapper>

          {/* Frame 5 */}
          <FrameWrapper
            index={4}
            scrollYProgress={scrollYProgress}
            isActive={currentFrame === 4}
          >
            <Frame5Technology progress={frame4Progress} isActive={currentFrame === 4} />
          </FrameWrapper>

          {/* Frame 6 */}
          <FrameWrapper
            index={5}
            scrollYProgress={scrollYProgress}
            isActive={currentFrame === 5}
          >
            <Frame6ThisIsTomi progress={frame5Progress} />
          </FrameWrapper>

          {/* Frame 7 */}
          <FrameWrapper
            index={6}
            scrollYProgress={scrollYProgress}
            isActive={currentFrame === 6}
          >
            <Frame7YourTurn
              onOpenChat={handleOpenChat}
              onRestart={handleRestart}
              onAssessmentClick={handleAssessmentClick}
            />
          </FrameWrapper>
        </div>
      </div>

      {/* Homi Chat Modal */}
      <HomiChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
