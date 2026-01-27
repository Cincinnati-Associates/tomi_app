"use client";

import { motion, useTransform, MotionValue } from "framer-motion";

interface Frame1TogetherProps {
  progress: MotionValue<number>;
}

// Cave painting style SVG elements that draw themselves
function CavePainting({ progress }: { progress: MotionValue<number> }) {
  // Staggered draw animations based on scroll progress
  const fireLength = useTransform(progress, [0, 0.3], [0, 1]);
  const humansLength = useTransform(progress, [0.1, 0.5], [0, 1]);
  const shelterLength = useTransform(progress, [0.3, 0.7], [0, 1]);
  const animalsLength = useTransform(progress, [0.5, 0.9], [0, 1]);

  return (
    <svg
      viewBox="0 0 800 400"
      className="w-full h-full max-w-3xl"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cave wall texture background */}
      <defs>
        <filter id="roughPaper" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
          <feDiffuseLighting in="noise" lightingColor="#C4A35A" surfaceScale="2">
            <feDistantLight azimuth="45" elevation="60" />
          </feDiffuseLighting>
        </filter>
        <pattern id="caveTexture" patternUnits="userSpaceOnUse" width="100" height="100">
          <rect width="100" height="100" fill="#8B7355" />
          <circle cx="20" cy="30" r="2" fill="#6B5344" opacity="0.5" />
          <circle cx="60" cy="70" r="3" fill="#6B5344" opacity="0.4" />
          <circle cx="80" cy="20" r="1.5" fill="#6B5344" opacity="0.6" />
        </pattern>
      </defs>

      {/* Background cave wall */}
      <rect
        x="0"
        y="0"
        width="800"
        height="400"
        className="fill-[#A08060] dark:fill-[#4A3728]"
        rx="20"
      />

      {/* Fire in center - warm ochre/orange */}
      <motion.g style={{ opacity: fireLength }}>
        {/* Fire base */}
        <motion.path
          d="M400 300 L380 280 Q370 250 390 230 Q400 210 410 230 Q430 250 420 280 L400 300"
          stroke="#D4722C"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            pathLength: fireLength,
            strokeDasharray: 1,
            strokeDashoffset: useTransform(fireLength, (v) => 1 - v),
          }}
        />
        {/* Inner flame */}
        <motion.path
          d="M400 290 L392 275 Q388 260 398 250 Q402 245 406 250 Q416 260 412 275 L400 290"
          stroke="#E8A54A"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          style={{
            pathLength: fireLength,
            strokeDasharray: 1,
            strokeDashoffset: useTransform(fireLength, (v) => 1 - v),
          }}
        />
        {/* Sparks */}
        <motion.circle cx="395" cy="220" r="3" fill="#E8A54A" style={{ opacity: fireLength }} />
        <motion.circle cx="408" cy="215" r="2" fill="#D4722C" style={{ opacity: fireLength }} />
      </motion.g>

      {/* Humans around fire - terracotta color */}
      <motion.g style={{ opacity: humansLength }}>
        {/* Person 1 - left, sitting */}
        <motion.path
          d="M320 310 L330 280 L340 290 M330 280 L325 260 Q330 250 335 260 L330 280 M325 260 L315 275 M335 260 L345 275"
          stroke="#8B4513"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            pathLength: humansLength,
            strokeDasharray: 1,
            strokeDashoffset: useTransform(humansLength, (v) => 1 - v),
          }}
        />
        {/* Head */}
        <motion.circle
          cx="330"
          cy="242"
          r="12"
          stroke="#8B4513"
          strokeWidth="3"
          fill="none"
          style={{ opacity: humansLength }}
        />

        {/* Person 2 - right, sitting */}
        <motion.path
          d="M480 310 L470 280 L460 290 M470 280 L475 260 Q470 250 465 260 L470 280 M475 260 L485 275 M465 260 L455 275"
          stroke="#8B4513"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            pathLength: humansLength,
            strokeDasharray: 1,
            strokeDashoffset: useTransform(humansLength, (v) => 1 - v),
          }}
        />
        <motion.circle
          cx="470"
          cy="242"
          r="12"
          stroke="#8B4513"
          strokeWidth="3"
          fill="none"
          style={{ opacity: humansLength }}
        />

        {/* Person 3 - far left, standing */}
        <motion.path
          d="M240 320 L240 280 M240 280 L235 260 Q240 250 245 260 L240 280 M235 260 L220 270 M245 260 L260 275 M240 320 L230 350 M240 320 L250 350"
          stroke="#8B4513"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            pathLength: humansLength,
            strokeDasharray: 1,
            strokeDashoffset: useTransform(humansLength, (v) => 1 - v),
          }}
        />
        <motion.circle
          cx="240"
          cy="242"
          r="12"
          stroke="#8B4513"
          strokeWidth="3"
          fill="none"
          style={{ opacity: humansLength }}
        />

        {/* Person 4 - far right */}
        <motion.path
          d="M560 320 L560 280 M560 280 L555 260 Q560 250 565 260 L560 280 M555 260 L540 275 M565 260 L580 270 M560 320 L550 350 M560 320 L570 350"
          stroke="#8B4513"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            pathLength: humansLength,
            strokeDasharray: 1,
            strokeDashoffset: useTransform(humansLength, (v) => 1 - v),
          }}
        />
        <motion.circle
          cx="560"
          cy="242"
          r="12"
          stroke="#8B4513"
          strokeWidth="3"
          fill="none"
          style={{ opacity: humansLength }}
        />
      </motion.g>

      {/* Shelter/hut - ochre color */}
      <motion.g style={{ opacity: shelterLength }}>
        <motion.path
          d="M100 350 L150 200 L200 350 M120 280 L150 230 L180 280"
          stroke="#B8860B"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            pathLength: shelterLength,
            strokeDasharray: 1,
            strokeDashoffset: useTransform(shelterLength, (v) => 1 - v),
          }}
        />
        {/* Thatch lines */}
        <motion.path
          d="M125 260 L150 215 M150 215 L175 260 M135 290 L150 245 L165 290"
          stroke="#B8860B"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          style={{
            pathLength: shelterLength,
            strokeDasharray: 1,
            strokeDashoffset: useTransform(shelterLength, (v) => 1 - v),
          }}
        />
      </motion.g>

      {/* Hunting animals - darker terracotta */}
      <motion.g style={{ opacity: animalsLength }}>
        {/* Deer/elk shape */}
        <motion.path
          d="M650 280 Q680 260 710 280 L700 310 L660 310 L650 280 M680 260 L680 240 L670 230 M680 240 L690 230"
          stroke="#654321"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            pathLength: animalsLength,
            strokeDasharray: 1,
            strokeDashoffset: useTransform(animalsLength, (v) => 1 - v),
          }}
        />
        {/* Small animal */}
        <motion.path
          d="M700 340 Q720 330 740 340 L735 355 L705 355 L700 340"
          stroke="#654321"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          style={{
            pathLength: animalsLength,
            strokeDasharray: 1,
            strokeDashoffset: useTransform(animalsLength, (v) => 1 - v),
          }}
        />
        {/* Hunter with spear */}
        <motion.path
          d="M620 350 L620 310 L615 290 Q620 280 625 290 L620 310 M615 290 L590 280 M625 290 L650 300 M590 280 L570 270"
          stroke="#8B4513"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          style={{
            pathLength: animalsLength,
            strokeDasharray: 1,
            strokeDashoffset: useTransform(animalsLength, (v) => 1 - v),
          }}
        />
        <motion.circle
          cx="620"
          cy="275"
          r="10"
          stroke="#8B4513"
          strokeWidth="2"
          fill="none"
          style={{ opacity: animalsLength }}
        />
      </motion.g>

      {/* Hand prints - signature cave art element */}
      <motion.g style={{ opacity: useTransform(progress, [0.6, 1], [0, 1]) }}>
        <motion.path
          d="M60 100 L60 70 M50 95 L45 75 M70 95 L75 75 M55 100 L50 85 M65 100 L70 85 Q60 120 60 100"
          stroke="#8B4513"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <motion.path
          d="M740 80 L740 50 M730 75 L725 55 M750 75 L755 55 M735 80 L730 65 M745 80 L750 65 Q740 100 740 80"
          stroke="#8B4513"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </motion.g>
    </svg>
  );
}

export function Frame1Together({ progress }: Frame1TogetherProps) {
  const textOpacity = useTransform(progress, [0.2, 0.5], [0, 1]);
  const textY = useTransform(progress, [0.2, 0.5], [30, 0]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 md:px-12">
      <div className="max-w-4xl w-full">
        {/* Title */}
        <motion.h1
          className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-foreground text-center mb-8 md:mb-12"
          style={{
            opacity: useTransform(progress, [0, 0.15], [0, 1]),
            y: useTransform(progress, [0, 0.15], [20, 0]),
          }}
        >
          We&apos;ve Always Been Together
        </motion.h1>

        {/* Cave painting illustration */}
        <div className="w-full aspect-[2/1] mb-8 md:mb-12">
          <CavePainting progress={progress} />
        </div>

        {/* Text content */}
        <motion.div
          className="text-center max-w-2xl mx-auto"
          style={{ opacity: textOpacity, y: textY }}
        >
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
            For <span className="text-foreground font-semibold">300,000 years</span>, humans lived together.
            We hunted together. Built shelter together. Raised children together.
          </p>
          <p className="text-lg md:text-xl lg:text-2xl text-foreground font-medium mt-4">
            Living alone? That&apos;s the weird new experiment.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
