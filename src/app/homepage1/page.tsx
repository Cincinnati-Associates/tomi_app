"use client";

import { useState } from "react";
import { HeroVariant } from "@/components/home/HeroVariant";
import { UnlockSection } from "@/components/home/UnlockSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { AIChatSimulation } from "@/components/home/AIChatSimulation";
import { StoryPreview } from "@/components/home/StoryPreview";
import { TomiDifference } from "@/components/home/TomiDifference";
import { FinalCta } from "@/components/home/FinalCta";
import { HomiChat } from "@/components/shared/HomiChat";
import { HomiChatTrigger } from "@/components/shared/HomiChatTrigger";

/**
 * Homepage Variant 1: The Aspirational Play
 * Goal: Test if users are motivated by the social and emotional benefit
 * of buying with people they care about.
 */
export default function Homepage1() {
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
      <HeroVariant
        headline={
          <>
            AI-Powered
            <br />
            <span className="text-primary">Home Co-Ownership</span>
          </>
        }
        subheadline={
          <>
            The easiest, most affordable, and rewarding way to own a home
            <br className="hidden sm:block" />
            with someone you aren&apos;t married to.
          </>
        }
        primaryCta={{
          text: "Run the Numbers",
          href: "/calc",
        }}
        onOpenChat={handleOpenChat}
        showTypewriter
      />
      <UnlockSection />
      <HowItWorks />
      <AIChatSimulation onOpenChat={handleOpenChat} />
      <StoryPreview />
      <TomiDifference />
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
