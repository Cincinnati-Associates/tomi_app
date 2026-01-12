"use client";

import { useTypewriter } from "@/hooks/useTypewriter";
import { cn } from "@/lib/utils";

interface TypewriterButtonProps {
  questions: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseAfterType?: number;
  pauseAfterDelete?: number;
  onQuestionClick: (question: string, isComplete: boolean) => void;
  className?: string;
}

export function TypewriterButton({
  questions,
  typeSpeed = 50,
  deleteSpeed = 30,
  pauseAfterType = 2500,
  pauseAfterDelete = 500,
  onQuestionClick,
  className,
}: TypewriterButtonProps) {
  const { displayText, fullText, isComplete, state, pause, resume, isPaused } =
    useTypewriter({
      texts: questions,
      typeSpeed,
      deleteSpeed,
      pauseAfterType,
      pauseAfterDelete,
    });

  const handleClick = () => {
    onQuestionClick(displayText || fullText, isComplete);
  };

  const showCursor = state !== "deleting" || isPaused;
  const cursorBlink = state === "paused" || state === "switching" || isPaused;

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      aria-label={fullText}
      className={cn(
        "inline-flex items-center justify-center",
        "px-5 py-3 md:px-6 md:py-3.5",
        "border-2 border-primary",
        "rounded-full",
        "bg-transparent",
        "text-primary",
        "font-medium text-sm md:text-base",
        "transition-all duration-200 ease-out",
        "hover:bg-primary/5",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "cursor-pointer",
        "min-w-0",
        "text-left",
        className
      )}
    >
      <span className="flex-1">
        {displayText}
        {showCursor && (
          <span
            className={cn(
              "inline-block w-[2px] h-[1.1em] bg-primary ml-[1px] align-middle",
              cursorBlink && "animate-blink"
            )}
          />
        )}
      </span>
    </button>
  );
}
