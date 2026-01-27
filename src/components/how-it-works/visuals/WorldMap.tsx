"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MapMarker {
  id: string;
  country: string;
  label: string;
  x: number;
  y: number;
}

interface WorldMapProps {
  props: {
    markers: MapMarker[];
    animateSequence?: boolean;
  };
}

export function WorldMap({ props }: WorldMapProps) {
  const { markers, animateSequence = true } = props;
  const [activeMarkers, setActiveMarkers] = useState<string[]>([]);

  useEffect(() => {
    if (!animateSequence) {
      setActiveMarkers(markers.map((m) => m.id));
      return;
    }

    // Animate markers appearing one by one
    markers.forEach((marker, index) => {
      setTimeout(() => {
        setActiveMarkers((prev) => [...prev, marker.id]);
      }, index * 600);
    });
  }, [markers, animateSequence]);

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="relative aspect-[2/1] bg-muted/30 rounded-2xl overflow-hidden">
        {/* Simplified world map SVG */}
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified continents */}
          <path
            d="M150 150 L250 120 L280 180 L200 220 L150 180 Z"
            className="fill-muted-foreground/20"
          />
          {/* North America */}
          <path
            d="M100 100 L200 80 L220 150 L180 200 L100 180 Z"
            className="fill-muted-foreground/20"
          />
          {/* South America */}
          <path
            d="M200 250 L250 230 L270 350 L220 400 L180 350 Z"
            className="fill-muted-foreground/20"
          />
          {/* Europe */}
          <path
            d="M450 100 L550 80 L560 150 L480 170 L450 140 Z"
            className="fill-muted-foreground/20"
          />
          {/* Africa */}
          <path
            d="M450 180 L550 160 L580 320 L480 350 L440 280 Z"
            className="fill-muted-foreground/20"
          />
          {/* Asia */}
          <path
            d="M550 80 L800 60 L850 200 L700 250 L550 200 Z"
            className="fill-muted-foreground/20"
          />
          {/* Australia */}
          <path
            d="M780 320 L880 300 L900 380 L820 400 L780 360 Z"
            className="fill-muted-foreground/20"
          />

          {/* Grid lines for visual interest */}
          {Array.from({ length: 5 }, (_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={(i + 1) * 100}
              x2="1000"
              y2={(i + 1) * 100}
              className="stroke-muted-foreground/10"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`v-${i}`}
              x1={(i + 1) * 100}
              y1="0"
              x2={(i + 1) * 100}
              y2="500"
              className="stroke-muted-foreground/10"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Animated markers */}
        {markers.map((marker) => {
          const isActive = activeMarkers.includes(marker.id);

          return (
            <motion.div
              key={marker.id}
              className="absolute"
              style={{
                left: `${marker.x}%`,
                top: `${marker.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={
                isActive
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/30"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: markers.indexOf(marker) * 0.3,
                }}
                style={{ width: 24, height: 24, margin: -4 }}
              />
              {/* Marker dot */}
              <div className="relative w-4 h-4 rounded-full bg-primary shadow-lg" />
              {/* Label */}
              <motion.div
                className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap"
                initial={{ opacity: 0, x: -10 }}
                animate={isActive ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 }}
              >
                <span className="text-xs font-medium bg-card px-2 py-1 rounded-full border border-border shadow-sm">
                  {marker.country}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <motion.div
        className="mt-6 flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: markers.length * 0.6 + 0.5 }}
      >
        {markers.map((marker) => (
          <span
            key={marker.id}
            className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full"
          >
            {marker.label}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
