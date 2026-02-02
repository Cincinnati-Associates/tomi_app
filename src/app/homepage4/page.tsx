"use client";

import { useState } from "react";
import { HeroVariant } from "@/components/home/HeroVariant";
import { ImpactStatement } from "@/components/home/ImpactStatement";
import { UnlockSection } from "@/components/home/UnlockSection";
import { SecondHero } from "@/components/home/SecondHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { AIConciergeSection } from "@/components/home/AIConciergeSection";
import { AgreementSection } from "@/components/home/AgreementSection";
import { NoCostSection } from "@/components/home/NoCostSection";
import { StoryPreview } from "@/components/home/StoryPreview";
import { TomiDifference } from "@/components/home/TomiDifference";
import { FinalCta } from "@/components/home/FinalCta";
import { HomiChat } from "@/components/shared/HomiChat";
import { HomiChatTrigger } from "@/components/shared/HomiChatTrigger";

/**
 * Homepage Variant 4: Two-Act Structure
 *
 * ACT 1: The Affordability Question
 * - How do you buy a home you can't afford?
 * - Answer: Shared homeownership (pooling resources)
 *
 * ACT 2: The Coordination Question
 * - How do you own a home with someone you aren't married to?
 * - Answer: Tomi — the AI operating system for co-ownership
 */
export default function Homepage4() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string | undefined>();

  const handleOpenChat = (message?: string) => {
    setInitialChatMessage(message);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setInitialChatMessage(undefined);
  };

  return (
    <>
      {/* ========================================
          ACT 1: THE AFFORDABILITY QUESTION
          ======================================== */}

      {/* Hero: The big question */}
      <HeroVariant
        headline={
          <>
            How Do You Buy a Home
            <br />
            <span className="text-primary">You Can&apos;t Afford?</span>
          </>
        }
        subheadline="Tomi helps people co-buy and manage homes together."
        primaryCta={{
          text: "Run the Numbers",
          href: "/calc",
        }}
        onOpenChat={handleOpenChat}
        showTypewriter
      />

      {/* Yellow impact: Social proof */}
      <ImpactStatement
        header="Every year, more than 1.7 million Americans buy a home with family or friends."
        subheader="We're about to make that number much larger."
      />

      {/* Calculator comparison: The proof */}
      <UnlockSection
        header={<>What if your barrier to homeownership wasn&apos;t cost<br />— but instead coordination?</>}
        subheader=""
      />

      {/* ========================================
          ACT 2: THE COORDINATION QUESTION
          ======================================== */}

      {/* Second Hero: The next question */}
      <SecondHero
        header="How do you own a home with someone you aren't married to?"
        subheader={<>Pooling money is simple. Keeping expectations, goals, priorities... life aligned for years to come?<br />We&apos;ve got AI for that.</>}
      />

      {/* How Tomi Works: The journey */}
      <HowItWorks
        header="works"
        subheader="Your shared home concierge, with you every step of the way."
      />

      {/* No Cost: The business model */}
      <NoCostSection onOpenChat={handleOpenChat} />

      {/* AI Concierge: The product */}
      <AIConciergeSection onOpenChat={handleOpenChat} />

      {/* Agreement Section: The legal piece */}
      <AgreementSection />

      {/* Stories: Social proof */}
      <StoryPreview />

      {/* Tomi Difference: Why us */}
      <TomiDifference />

      {/* Final CTA */}
      <FinalCta onOpenChat={() => handleOpenChat()} />

      {/* Floating chat trigger */}
      <HomiChatTrigger onClick={() => handleOpenChat()} />

      {/* Chat modal */}
      <HomiChat
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        initialMessage={initialChatMessage}
      />
    </>
  );
}
