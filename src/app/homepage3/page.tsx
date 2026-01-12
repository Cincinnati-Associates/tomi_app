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
 * Homepage Variant 3: The Bold Modernist
 * Goal: Test if a direct, punchy statement builds more brand authority.
 */
export default function Homepage3() {
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
            Homeownership. <span className="text-primary">Together.</span>
          </>
        }
        subheadline={
          <>
            <span className="md:whitespace-nowrap">Every year millions of Americans buy property with someone they aren&apos;t married to.</span>
            <br />
            <span className="font-semibold text-foreground">
              We&apos;re about to make that number much larger.
            </span>
          </>
        }
        primaryCta={{
          text: "Start your journey",
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
