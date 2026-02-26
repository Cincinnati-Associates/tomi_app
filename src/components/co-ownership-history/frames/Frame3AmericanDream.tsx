"use client";

import { motion, useTransform, MotionValue } from "framer-motion";

interface Frame3AmericanDreamProps {
  progress: MotionValue<number>;
}

function AmericanDreamHouse({ progress }: { progress: MotionValue<number> }) {
  // As scroll progresses, the image becomes more distorted
  const grayscale = useTransform(progress, [0.3, 0.7], [0, 0.8]);
  const sepia = useTransform(progress, [0, 0.3], [0.6, 0]);
  const blur = useTransform(progress, [0.5, 0.9], [0, 2]);
  const glitchOffset = useTransform(progress, [0.6, 1], [0, 8]);
  const crackOpacity = useTransform(progress, [0.4, 0.8], [0, 1]);

  return (
    <div className="relative w-full max-w-2xl aspect-[16/10] mx-auto overflow-hidden rounded-2xl">
      {/* Base layer - the "perfect" 1950s home */}
      <motion.div
        className="absolute inset-0"
        style={{
          filter: useTransform(
            [grayscale, sepia, blur] as MotionValue<number>[],
            ([g, s, b]) =>
              `grayscale(${g}) sepia(${s}) blur(${b}px) contrast(${1 + (g as number) * 0.2})`
          ),
        }}
      >
        {/* House illustration using SVG */}
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sky gradient */}
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87CEEB" />
              <stop offset="100%" stopColor="#E0F4FF" />
            </linearGradient>
            <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7CB342" />
              <stop offset="100%" stopColor="#558B2F" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect x="0" y="0" width="800" height="350" fill="url(#skyGradient)" />

          {/* Sun */}
          <circle cx="650" cy="80" r="40" fill="#FFD54F" />

          {/* Clouds */}
          <g fill="white" opacity="0.8">
            <ellipse cx="150" cy="60" rx="50" ry="25" />
            <ellipse cx="190" cy="55" rx="40" ry="20" />
            <ellipse cx="120" cy="50" rx="35" ry="18" />
          </g>

          {/* Ground/lawn */}
          <rect x="0" y="350" width="800" height="150" fill="url(#grassGradient)" />

          {/* White picket fence */}
          <g fill="white" stroke="#E0E0E0" strokeWidth="1">
            {/* Left fence */}
            {[0, 30, 60, 90, 120].map((x) => (
              <g key={`fence-l-${x}`}>
                <rect x={x + 20} y="360" width="8" height="60" rx="2" />
                <polygon points={`${x + 24},360 ${x + 20},350 ${x + 28},350`} />
              </g>
            ))}
            {/* Horizontal bars */}
            <rect x="20" y="375" width="130" height="6" rx="2" />
            <rect x="20" y="400" width="130" height="6" rx="2" />

            {/* Right fence */}
            {[0, 30, 60, 90, 120].map((x) => (
              <g key={`fence-r-${x}`}>
                <rect x={x + 650} y="360" width="8" height="60" rx="2" />
                <polygon points={`${x + 654},360 ${x + 650},350 ${x + 658},350`} />
              </g>
            ))}
            <rect x="650" y="375" width="130" height="6" rx="2" />
            <rect x="650" y="400" width="130" height="6" rx="2" />
          </g>

          {/* House */}
          <g>
            {/* House body */}
            <rect x="250" y="200" width="300" height="200" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="2" />

            {/* Roof */}
            <polygon points="400,80 200,200 600,200" fill="#B71C1C" stroke="#8B0000" strokeWidth="2" />

            {/* Chimney */}
            <rect x="480" y="100" width="40" height="80" fill="#8B4513" />

            {/* Door */}
            <rect x="365" y="280" width="70" height="120" fill="#5D4037" rx="4" />
            <circle cx="420" cy="345" r="5" fill="#FFD700" />

            {/* Windows */}
            <g fill="#87CEEB" stroke="#5D4037" strokeWidth="3">
              <rect x="280" y="230" width="60" height="60" rx="2" />
              <rect x="460" y="230" width="60" height="60" rx="2" />
              {/* Attic window */}
              <circle cx="400" cy="150" r="25" />
            </g>

            {/* Window crosses */}
            <g stroke="#5D4037" strokeWidth="2">
              <line x1="310" y1="230" x2="310" y2="290" />
              <line x1="280" y1="260" x2="340" y2="260" />
              <line x1="490" y1="230" x2="490" y2="290" />
              <line x1="460" y1="260" x2="520" y2="260" />
            </g>

            {/* Shutters */}
            <g fill="#1565C0">
              <rect x="265" y="225" width="12" height="70" rx="2" />
              <rect x="343" y="225" width="12" height="70" rx="2" />
              <rect x="445" y="225" width="12" height="70" rx="2" />
              <rect x="523" y="225" width="12" height="70" rx="2" />
            </g>
          </g>

          {/* Path to door */}
          <path
            d="M400 500 Q400 450 400 400"
            stroke="#9E9E9E"
            strokeWidth="50"
            strokeLinecap="round"
            fill="none"
          />

          {/* Flowers/bushes */}
          <g>
            {/* Left bushes */}
            <ellipse cx="270" cy="395" rx="30" ry="20" fill="#2E7D32" />
            <circle cx="260" cy="380" r="5" fill="#E91E63" />
            <circle cx="275" cy="385" r="4" fill="#FFC107" />
            <circle cx="280" cy="378" r="4" fill="#E91E63" />

            {/* Right bushes */}
            <ellipse cx="530" cy="395" rx="30" ry="20" fill="#2E7D32" />
            <circle cx="520" cy="380" r="5" fill="#FFC107" />
            <circle cx="535" cy="385" r="4" fill="#E91E63" />
            <circle cx="540" cy="378" r="4" fill="#FFC107" />
          </g>

          {/* Tree */}
          <rect x="680" y="280" width="20" height="120" fill="#5D4037" />
          <circle cx="690" cy="250" r="60" fill="#388E3C" />

          {/* Family in front of house */}
          <g>
            {/* Dad - on the left */}
            <g transform="translate(300, 360)">
              {/* Body */}
              <rect x="-12" y="20" width="24" height="45" rx="4" fill="#1565C0" />
              {/* Head */}
              <circle cx="0" cy="5" r="18" fill="#FFCC80" />
              {/* Hair */}
              <ellipse cx="0" cy="-5" rx="16" ry="10" fill="#5D4037" />
              {/* Eyes */}
              <circle cx="-6" cy="2" r="2" fill="#333" />
              <circle cx="6" cy="2" r="2" fill="#333" />
              {/* Smile */}
              <path d="M-6 10 Q0 16 6 10" stroke="#333" strokeWidth="2" fill="none" />
              {/* Legs */}
              <rect x="-10" y="65" width="8" height="30" fill="#424242" />
              <rect x="2" y="65" width="8" height="30" fill="#424242" />
              {/* Shoes */}
              <ellipse cx="-6" cy="97" rx="6" ry="4" fill="#333" />
              <ellipse cx="6" cy="97" rx="6" ry="4" fill="#333" />
            </g>

            {/* Mom - next to dad */}
            <g transform="translate(345, 365)">
              {/* Dress */}
              <path d="M-15 20 L-10 70 L10 70 L15 20 Q0 15 -15 20" fill="#E91E63" />
              {/* Head */}
              <circle cx="0" cy="5" r="16" fill="#FFCC80" />
              {/* Hair */}
              <ellipse cx="0" cy="-2" rx="18" ry="14" fill="#5D4037" />
              <ellipse cx="-14" cy="8" rx="5" ry="12" fill="#5D4037" />
              <ellipse cx="14" cy="8" rx="5" ry="12" fill="#5D4037" />
              {/* Eyes */}
              <circle cx="-5" cy="2" r="2" fill="#333" />
              <circle cx="5" cy="2" r="2" fill="#333" />
              {/* Smile */}
              <path d="M-5 9 Q0 14 5 9" stroke="#333" strokeWidth="2" fill="none" />
              {/* Legs */}
              <rect x="-6" y="70" width="5" height="20" fill="#FFCC80" />
              <rect x="1" y="70" width="5" height="20" fill="#FFCC80" />
              {/* Shoes */}
              <ellipse cx="-4" cy="92" rx="5" ry="3" fill="#333" />
              <ellipse cx="4" cy="92" rx="5" ry="3" fill="#333" />
            </g>

            {/* Kid 1 - boy in front */}
            <g transform="translate(320, 400)">
              {/* Body */}
              <rect x="-8" y="12" width="16" height="28" rx="3" fill="#4CAF50" />
              {/* Head */}
              <circle cx="0" cy="2" r="12" fill="#FFCC80" />
              {/* Hair */}
              <ellipse cx="0" cy="-4" rx="10" ry="7" fill="#8D6E63" />
              {/* Eyes */}
              <circle cx="-4" cy="0" r="1.5" fill="#333" />
              <circle cx="4" cy="0" r="1.5" fill="#333" />
              {/* Smile */}
              <path d="M-3 6 Q0 9 3 6" stroke="#333" strokeWidth="1.5" fill="none" />
              {/* Legs */}
              <rect x="-6" y="40" width="5" height="18" fill="#1565C0" />
              <rect x="1" y="40" width="5" height="18" fill="#1565C0" />
              {/* Shoes */}
              <ellipse cx="-4" cy="60" rx="4" ry="3" fill="#333" />
              <ellipse cx="4" cy="60" rx="4" ry="3" fill="#333" />
            </g>

            {/* Kid 2 - girl */}
            <g transform="translate(365, 402)">
              {/* Dress */}
              <path d="M-10 12 L-8 45 L8 45 L10 12 Q0 8 -10 12" fill="#9C27B0" />
              {/* Head */}
              <circle cx="0" cy="2" r="11" fill="#FFCC80" />
              {/* Hair with pigtails */}
              <ellipse cx="0" cy="-3" rx="10" ry="8" fill="#FFA726" />
              <circle cx="-12" cy="0" r="6" fill="#FFA726" />
              <circle cx="12" cy="0" r="6" fill="#FFA726" />
              {/* Eyes */}
              <circle cx="-4" cy="0" r="1.5" fill="#333" />
              <circle cx="4" cy="0" r="1.5" fill="#333" />
              {/* Smile */}
              <path d="M-3 6 Q0 9 3 6" stroke="#333" strokeWidth="1.5" fill="none" />
              {/* Legs */}
              <rect x="-4" y="45" width="4" height="12" fill="#FFCC80" />
              <rect x="0" y="45" width="4" height="12" fill="#FFCC80" />
              {/* Shoes */}
              <ellipse cx="-2" cy="58" rx="4" ry="2" fill="#E91E63" />
              <ellipse cx="2" cy="58" rx="4" ry="2" fill="#E91E63" />
            </g>

            {/* Kid 3 (half kid) - peeking from behind/cut off at edge */}
            <g transform="translate(275, 405)">
              {/* Only show right half - clipped */}
              <clipPath id="halfKidClip">
                <rect x="-5" y="-20" width="30" height="100" />
              </clipPath>
              <g clipPath="url(#halfKidClip)">
                {/* Body */}
                <rect x="-8" y="12" width="16" height="25" rx="3" fill="#FF9800" />
                {/* Head */}
                <circle cx="0" cy="2" r="11" fill="#FFCC80" />
                {/* Hair */}
                <ellipse cx="0" cy="-4" rx="9" ry="6" fill="#5D4037" />
                {/* Eye (only right one visible) */}
                <circle cx="4" cy="0" r="1.5" fill="#333" />
                {/* Half smile */}
                <path d="M0 6 Q3 8 4 6" stroke="#333" strokeWidth="1.5" fill="none" />
                {/* Leg */}
                <rect x="1" y="37" width="5" height="16" fill="#1565C0" />
                {/* Shoe */}
                <ellipse cx="4" cy="55" rx="4" ry="3" fill="#333" />
              </g>
            </g>

            {/* Dog - golden retriever style */}
            <g transform="translate(395, 435)">
              {/* Body */}
              <ellipse cx="0" cy="10" rx="22" ry="14" fill="#D4A056" />
              {/* Head */}
              <circle cx="20" cy="0" r="14" fill="#D4A056" />
              {/* Snout */}
              <ellipse cx="32" cy="4" rx="8" ry="6" fill="#C4915A" />
              {/* Nose */}
              <ellipse cx="38" cy="3" rx="3" ry="2" fill="#333" />
              {/* Eye */}
              <circle cx="24" cy="-2" r="3" fill="#333" />
              <circle cx="25" cy="-3" r="1" fill="white" />
              {/* Ear */}
              <ellipse cx="12" cy="-4" rx="8" ry="12" fill="#B8860B" />
              {/* Tail - wagging up */}
              <path d="M-22 5 Q-35 -10 -30 -20" stroke="#D4A056" strokeWidth="8" strokeLinecap="round" fill="none" />
              {/* Legs */}
              <rect x="-12" y="20" width="6" height="18" rx="3" fill="#D4A056" />
              <rect x="2" y="20" width="6" height="18" rx="3" fill="#D4A056" />
              <rect x="12" y="18" width="6" height="16" rx="3" fill="#D4A056" />
              {/* Tongue */}
              <ellipse cx="36" cy="10" rx="3" ry="5" fill="#E57373" />
            </g>
          </g>
        </svg>
      </motion.div>

      {/* Glitch/distortion layers */}
      <motion.div
        className="absolute inset-0 bg-red-500/10 mix-blend-color-dodge pointer-events-none"
        style={{
          opacity: useTransform(progress, [0.6, 1], [0, 0.3]),
          x: glitchOffset,
        }}
      />
      <motion.div
        className="absolute inset-0 bg-blue-500/10 mix-blend-color-dodge pointer-events-none"
        style={{
          opacity: useTransform(progress, [0.6, 1], [0, 0.3]),
          x: useTransform(glitchOffset, (v) => -v),
        }}
      />

      {/* Crack overlay */}
      <motion.svg
        viewBox="0 0 800 500"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: crackOpacity }}
      >
        <path
          d="M200 0 L220 80 L180 160 L240 250 L200 350 L260 450 L220 500"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M600 0 L580 100 L620 200 L560 300 L600 400 L560 500"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M0 250 L100 240 L200 260 L300 245 L400 255 L500 240 L600 260 L700 250 L800 245"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="2"
          fill="none"
        />
      </motion.svg>

      {/* Vignette effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.5) 100%)",
          opacity: useTransform(progress, [0.4, 0.9], [0, 0.8]),
        }}
      />
    </div>
  );
}

export function Frame3AmericanDream({ progress }: Frame3AmericanDreamProps) {
  const titleOpacity = useTransform(progress, [0, 0.15], [0, 1]);

  // Text overlays that fade in as scroll progresses
  const text1Opacity = useTransform(progress, [0.25, 0.4], [0, 1]);
  const text2Opacity = useTransform(progress, [0.4, 0.55], [0, 1]);
  const text3Opacity = useTransform(progress, [0.55, 0.7], [0, 1]);
  const narrativeOpacity = useTransform(progress, [0.7, 0.9], [0, 1]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 md:px-12">
      <div className="max-w-4xl w-full">
        {/* Title */}
        <motion.h2
          className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-foreground text-center mb-4 md:mb-6"
          style={{ opacity: titleOpacity }}
        >
          The American Dream<sup className="text-2xl md:text-3xl">TM</sup>
        </motion.h2>

        {/* House illustration with effects */}
        <div className="relative mb-8">
          <AmericanDreamHouse progress={progress} />

          {/* Floating text overlays */}
          <motion.div
            className="absolute top-4 left-4 md:top-8 md:left-8"
            style={{ opacity: text1Opacity }}
          >
            <span className="text-lg md:text-2xl font-heading font-bold text-foreground bg-background/80 px-3 py-1 rounded">
              Work hard.
            </span>
          </motion.div>

          <motion.div
            className="absolute top-1/3 right-4 md:right-8"
            style={{ opacity: text2Opacity }}
          >
            <span className="text-lg md:text-2xl font-heading font-bold text-foreground bg-background/80 px-3 py-1 rounded">
              Buy a house.
            </span>
          </motion.div>

          <motion.div
            className="absolute bottom-1/4 left-1/4"
            style={{ opacity: text3Opacity }}
          >
            <span className="text-lg md:text-2xl font-heading font-bold text-destructive bg-background/80 px-3 py-1 rounded">
              On your own.
            </span>
          </motion.div>
        </div>

        {/* Narrative text */}
        <motion.div
          className="text-center max-w-2xl mx-auto"
          style={{ opacity: narrativeOpacity }}
        >
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
            Somewhere along the way, we were told a different story.
            <span className="block mt-4 text-foreground font-medium">
              That success meant doing it alone.
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
