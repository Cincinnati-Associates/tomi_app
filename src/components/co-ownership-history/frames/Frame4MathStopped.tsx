"use client";

import { useEffect, useState } from "react";
import { motion, useTransform, MotionValue } from "framer-motion";

interface Frame4MathStoppedProps {
  progress: MotionValue<number>;
  isActive: boolean;
}

function DivergingLinesChart({
  progress,
  isActive,
}: {
  progress: MotionValue<number>;
  isActive: boolean;
}) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animate the lines drawing
  useEffect(() => {
    if (!isActive) return;

    let animationFrame: number;
    let startTime: number;
    const duration = 2000; // 2 seconds to draw

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setAnimatedProgress(progress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isActive]);

  // Data points for the chart (normalized 0-100 scale)
  const years = [1970, 1980, 1990, 2000, 2010, 2020, 2024];

  // Home prices started at 2x income, now at 8x
  // We'll show relative growth - home prices grew much faster
  const homePriceData = [10, 18, 28, 42, 55, 85, 100]; // Represents the multiplier growth
  const wageData = [10, 15, 20, 25, 30, 36, 40]; // Much slower growth

  const chartWidth = 700;
  const chartHeight = 350;
  const paddingX = 60;
  const paddingY = 40;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Generate path data
  const getPath = (data: number[]) => {
    const points = data.map((value, index) => {
      const x = paddingX + (index / (data.length - 1)) * innerWidth;
      const y = paddingY + innerHeight - (value / 100) * innerHeight;
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  const homePricePath = getPath(homePriceData);
  const wagePath = getPath(wageData);

  // Calculate gap area for highlight
  const gapAreaPath = () => {
    const homePoints = homePriceData.map((value, index) => {
      const x = paddingX + (index / (homePriceData.length - 1)) * innerWidth;
      const y = paddingY + innerHeight - (value / 100) * innerHeight;
      return `${x},${y}`;
    });
    const wagePointsReversed = [...wageData].reverse().map((value, index) => {
      const reversedIndex = wageData.length - 1 - index;
      const x = paddingX + (reversedIndex / (wageData.length - 1)) * innerWidth;
      const y = paddingY + innerHeight - (value / 100) * innerHeight;
      return `${x},${y}`;
    });
    return `M ${homePoints.join(" L ")} L ${wagePointsReversed.join(" L ")} Z`;
  };

  const gapOpacity = useTransform(progress, [0.5, 0.8], [0, 0.3]);

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className="w-full h-full max-w-3xl"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect
        x="0"
        y="0"
        width={chartWidth}
        height={chartHeight}
        className="fill-card"
        rx="12"
      />

      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((value) => {
        const y = paddingY + innerHeight - (value / 100) * innerHeight;
        return (
          <line
            key={value}
            x1={paddingX}
            y1={y}
            x2={chartWidth - paddingX}
            y2={y}
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        );
      })}

      {/* Gap area highlight */}
      <motion.path
        d={gapAreaPath()}
        className="fill-destructive"
        style={{ opacity: gapOpacity }}
      />

      {/* Wage line */}
      <motion.path
        d={wagePath}
        fill="none"
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          pathLength: animatedProgress,
          strokeDasharray: 1,
          strokeDashoffset: 1 - animatedProgress,
        }}
      />

      {/* Home price line */}
      <motion.path
        d={homePricePath}
        fill="none"
        className="stroke-destructive"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          pathLength: animatedProgress,
          strokeDasharray: 1,
          strokeDashoffset: 1 - animatedProgress,
        }}
      />

      {/* Data points */}
      {homePriceData.map((value, index) => {
        const x = paddingX + (index / (homePriceData.length - 1)) * innerWidth;
        const y = paddingY + innerHeight - (value / 100) * innerHeight;
        const showPoint = animatedProgress > index / (homePriceData.length - 1);

        return (
          <motion.circle
            key={`home-${index}`}
            cx={x}
            cy={y}
            r="6"
            className="fill-destructive"
            initial={{ opacity: 0, scale: 0 }}
            animate={showPoint ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
          />
        );
      })}

      {wageData.map((value, index) => {
        const x = paddingX + (index / (wageData.length - 1)) * innerWidth;
        const y = paddingY + innerHeight - (value / 100) * innerHeight;
        const showPoint = animatedProgress > index / (wageData.length - 1);

        return (
          <motion.circle
            key={`wage-${index}`}
            cx={x}
            cy={y}
            r="6"
            className="fill-primary"
            initial={{ opacity: 0, scale: 0 }}
            animate={showPoint ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
          />
        );
      })}

      {/* X-axis labels */}
      {years.map((year, index) => {
        const x = paddingX + (index / (years.length - 1)) * innerWidth;
        return (
          <text
            key={year}
            x={x}
            y={chartHeight - 10}
            textAnchor="middle"
            className="fill-muted-foreground text-xs font-medium"
          >
            {year}
          </text>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${paddingX}, ${paddingY - 15})`}>
        <circle cx="0" cy="0" r="5" className="fill-destructive" />
        <text x="12" y="4" className="fill-foreground text-xs font-medium">
          Home Prices
        </text>

        <circle cx="120" cy="0" r="5" className="fill-primary" />
        <text x="132" y="4" className="fill-foreground text-xs font-medium">
          Median Wages
        </text>
      </g>
    </svg>
  );
}

function AnimatedStat({
  value,
  suffix,
  label,
  delay = 0,
  isActive,
}: {
  value: number;
  suffix: string;
  label: string;
  delay?: number;
  isActive: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timeout = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay, isActive]);

  return (
    <div className="text-center">
      <div className="font-heading text-4xl md:text-5xl font-bold tabular-nums">
        {displayValue}
        <span className="text-2xl md:text-3xl">{suffix}</span>
      </div>
      <p className="text-sm md:text-base text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export function Frame4MathStopped({ progress, isActive }: Frame4MathStoppedProps) {
  const titleOpacity = useTransform(progress, [0, 0.15], [0, 1]);
  const chartOpacity = useTransform(progress, [0.1, 0.3], [0, 1]);
  const statsOpacity = useTransform(progress, [0.4, 0.6], [0, 1]);
  const textOpacity = useTransform(progress, [0.6, 0.8], [0, 1]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 md:px-12">
      <div className="max-w-4xl w-full">
        {/* Title */}
        <motion.h2
          className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-foreground text-center mb-4 md:mb-6"
          style={{ opacity: titleOpacity }}
        >
          The Math Stopped Working
        </motion.h2>

        {/* Chart */}
        <motion.div
          className="w-full aspect-[2/1] mb-8 md:mb-10"
          style={{ opacity: chartOpacity }}
        >
          <DivergingLinesChart progress={progress} isActive={isActive} />
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 gap-8 mb-8 md:mb-10"
          style={{ opacity: statsOpacity }}
        >
          <div className="text-destructive">
            <AnimatedStat
              value={147}
              suffix="%"
              label="Home price increase (5 years)"
              isActive={isActive}
            />
          </div>
          <div className="text-primary">
            <AnimatedStat
              value={12}
              suffix="%"
              label="Wage growth (5 years)"
              delay={300}
              isActive={isActive}
            />
          </div>
        </motion.div>

        {/* Text content */}
        <motion.div
          className="text-center max-w-2xl mx-auto"
          style={{ opacity: textOpacity }}
        >
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
            In <span className="text-foreground font-semibold">1970</span>, the average home cost{" "}
            <span className="text-foreground font-semibold">2x</span> the median income.
          </p>
          <p className="text-base md:text-lg lg:text-xl text-foreground font-medium mt-4">
            Today? It&apos;s <span className="text-destructive font-bold">8x</span>.
          </p>
          <p className="text-base md:text-lg text-muted-foreground mt-4">
            The individual path to homeownership is closing. But together, we can still get there.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
