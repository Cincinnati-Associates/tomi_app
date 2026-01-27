"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Testimonial data structure
interface Testimonial {
  id: number;
  name: string;
  location: string;
  quote: string;
  context?: string;
  coOwnershipDetails?: string;
  source: string;
  type: "personal" | "expert";
  title?: string; // For experts
  quoteSize?: "sm" | "md" | "lg"; // Font size for quote (based on length)
}

// Real testimonials from news sources
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Brooks-Flemister Group",
    location: "New York City",
    quote: "Co-buying was the best decision we've made. I wish I had thought about it sooner. The community alone is the biggest piece of all of it, and it's going to keep growing. I can't wait to see how big our village gets.",
    context: "Four friends (two couples) bought a house together",
    coOwnershipDetails: "$735,000 home, 4 co-owners, 25% each",
    source: "CNBC Make It",
    type: "personal",
    quoteSize: "sm",
  },
  {
    id: 2,
    name: "Tammy Kremer",
    location: "United States",
    quote: "I missed the feeling of coming home to people, and I missed the feeling of sharing food and being in community.",
    context: "Co-bought with friend Hayley Currier after pandemic isolation",
    source: "NPR",
    type: "personal",
    quoteSize: "md",
  },
  {
    id: 3,
    name: "Andrew Moore",
    location: "Brooklyn, NY",
    quote: "Being able to live next to people I trust and care about was really important to me.",
    context: "Three friends bought a multi-family brownstone together",
    coOwnershipDetails: "Multi-family brownstone, 3 co-owners",
    source: "New York Times",
    type: "personal",
    quoteSize: "lg",
  },
  {
    id: 5,
    name: "Sharon Kim",
    location: "New York",
    quote: "Although we have our differences, knowing that at the end family is family and trying to really set aside our differences to work together has worked out for the best between us.",
    context: "24-year-old bought with her brother and sister-in-law",
    coOwnershipDetails: "$750K home, 3 family members",
    source: "CNBC",
    type: "personal",
    quoteSize: "sm",
  },
  {
    id: 10,
    name: "Alex Reyna",
    location: "Austin, TX",
    quote: "If I have somebody to pay half my mortgage it'd be a whole different story. Not only does this put us in a house, but it's also building something for our future and I think that was massive for both of us.",
    context: "Teamed up with a friend to purchase a home when solo buying felt unattainable",
    source: "TIME",
    type: "personal",
    quoteSize: "sm",
  },
  {
    id: 11,
    name: "Heath Schechinger",
    location: "Northern California",
    quote: "We all wanted to be able to eventually be a homeowner. Living in the Bay Area that just seems so financially out of reach for all of us.",
    context: "Bought with friends seeking intentional community beyond traditional housing",
    source: "TIME",
    type: "personal",
    quoteSize: "md",
  },
  {
    id: 7,
    name: "Daryl Fairweather",
    title: "Chief Economist, Redfin",
    location: "",
    quote: "We've heard of more buyers having to team up to be able to afford a home. This is a story that we've been hearing really for a long time because affordability just keeps getting worse and worse.",
    source: "NPR",
    type: "expert",
  },
  {
    id: 8,
    name: "Amanda Pendleton",
    title: "Home Trends Expert, Zillow",
    location: "",
    quote: "Co-buying was not a thing a decade ago. This is in response to the affordability crisis we're dealing with.",
    source: "CNBC",
    type: "expert",
  },
  {
    id: 9,
    name: "Jennifer Patchen",
    title: "VP of Operations, Opendoor",
    location: "",
    quote: "Co-ownership is like carpooling for homes — lowering the entry barrier and addressing affordability challenges.",
    source: "Fortune",
    type: "expert",
  },
];

// Separate personal stories from expert quotes
const personalStories = testimonials.filter((t) => t.type === "personal");
const expertQuotes = testimonials.filter((t) => t.type === "expert");

export function StoryPreview() {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.1 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentTestimonial = personalStories[currentIndex];

  // Auto-rotate through testimonials
  useEffect(() => {
    if (!isInView || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % personalStories.length);
    }, 8000); // 8 seconds per testimonial

    return () => clearInterval(interval);
  }, [isInView, isPaused]);

  const goToPrevious = () => {
    setIsPaused(true);
    setCurrentIndex((prev) =>
      prev === 0 ? personalStories.length - 1 : prev - 1
    );
    setTimeout(() => setIsPaused(false), 15000);
  };

  const goToNext = () => {
    setIsPaused(true);
    setCurrentIndex((prev) => (prev + 1) % personalStories.length);
    setTimeout(() => setIsPaused(false), 15000);
  };

  const goToIndex = (index: number) => {
    setIsPaused(true);
    setCurrentIndex(index);
    setTimeout(() => setIsPaused(false), 15000);
  };

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl mb-4">
            Real People. Real Stories. Real Homeownership.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            More than 1.7 million unmarried Americans are co-buying homes each year.
          </p>
        </motion.div>

        {/* Main testimonial card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-card border border-border"
        >
          <div className="grid md:grid-cols-2">
            {/* Image placeholder - will be replaced with actual photos */}
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[400px] bg-gradient-to-br from-primary/20 via-accent/10 to-secondary">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="text-6xl mb-4">🏠</div>
                  <p className="text-sm text-muted-foreground">
                    Photo coming soon
                  </p>
                </div>
              </div>

              {/* Quote icon overlay */}
              <div className="absolute top-6 left-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Quote className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-5"
                >
                  {/* Quote */}
                  <blockquote
                    className={cn(
                      "font-heading font-bold text-foreground leading-tight",
                      currentTestimonial.quoteSize === "sm" && "text-base md:text-lg lg:text-xl",
                      currentTestimonial.quoteSize === "md" && "text-lg md:text-xl lg:text-2xl",
                      (currentTestimonial.quoteSize === "lg" || !currentTestimonial.quoteSize) && "text-xl md:text-2xl lg:text-3xl"
                    )}
                  >
                    &ldquo;{currentTestimonial.quote}&rdquo;
                  </blockquote>

                  {/* Attribution */}
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">
                      {currentTestimonial.name}
                    </p>
                    {currentTestimonial.location && (
                      <p className="text-sm text-muted-foreground">
                        {currentTestimonial.location}
                      </p>
                    )}
                  </div>

                  {/* Context & Details */}
                  {(currentTestimonial.context || currentTestimonial.coOwnershipDetails) && (
                    <div className="pt-2 border-t border-border space-y-2">
                      {currentTestimonial.context && (
                        <p className="text-sm text-muted-foreground">
                          {currentTestimonial.context}
                        </p>
                      )}
                      {currentTestimonial.coOwnershipDetails && (
                        <p className="text-sm font-medium text-primary">
                          {currentTestimonial.coOwnershipDetails}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Source */}
                  <p className="text-xs text-muted-foreground/70 uppercase tracking-wide">
                    Source: {currentTestimonial.source}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              <div className="absolute bottom-6 right-6 flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <button
                  onClick={goToNext}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 flex items-center gap-2">
            {personalStories.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Expert quotes section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 md:mt-14"
        >
          <p className="text-center text-sm text-muted-foreground uppercase tracking-wide mb-6">
            What the experts are saying
          </p>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {expertQuotes.map((expert, index) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-card border border-border rounded-xl p-5"
              >
                <Quote className="w-6 h-6 text-primary/40 mb-3" />
                <p className="text-sm text-foreground leading-relaxed mb-4">
                  &ldquo;{expert.quote}&rdquo;
                </p>
                <div className="border-t border-border pt-3 flex items-end justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {expert.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {expert.title}
                    </p>
                  </div>
                  {/* Company logo */}
                  <div className="flex-shrink-0">
                    {expert.title?.includes("Redfin") && (
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                        <Image
                          src="/logos/redfin-logo.png"
                          alt="Redfin"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {expert.title?.includes("Zillow") && (
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src="/logos/zillow-logo.png"
                          alt="Zillow"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {expert.title?.includes("Opendoor") && (
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                        <Image
                          src="/logos/opendoor-logo.png"
                          alt="Opendoor"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
