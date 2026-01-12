"use client";

import { useState } from "react";
import { HeroVariant } from "@/components/home/HeroVariant";
import { UnlockSection } from "@/components/home/UnlockSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ObjectionCards } from "@/components/home/ObjectionCards";
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
            The home you want,
            <br />
            <span className="text-primary">with the people you want in it.</span>
          </>
        }
        subheadline={
          <>
            You don&apos;t have to wait for wedding bells to start building equity.
            <br className="hidden sm:block" />
            <span className="font-semibold text-foreground">
              Tomi provides the legal and financial infrastructure to safely buy property with friends, partners, or family.
            </span>
          </>
        }
        primaryCta={{
          text: "What's my co-buying power?",
          href: "/calculator",
        }}
        onOpenChat={handleOpenChat}
        showTypewriter
      />
      <UnlockSection />
      <HowItWorks />
      <ObjectionCards />
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
