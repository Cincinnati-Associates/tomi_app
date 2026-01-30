"use client";

import { useState } from "react";
import { HeroVariant } from "@/components/home/HeroVariant";
import { ImpactStatement } from "@/components/home/ImpactStatement";
import { UnlockSection } from "@/components/home/UnlockSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { NoCostSection } from "@/components/home/NoCostSection";
import { AIConciergeSection } from "@/components/home/AIConciergeSection";
import { AgreementSection } from "@/components/home/AgreementSection";
import { StoryPreview } from "@/components/home/StoryPreview";
import { TomiDifference } from "@/components/home/TomiDifference";
import { FinalCta } from "@/components/home/FinalCta";
import { HomiChat } from "@/components/shared/HomiChat";
import { HomiChatTrigger } from "@/components/shared/HomiChatTrigger";

export default function Home() {
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
      <UnlockSection
        header={<>What if your barrier to homeownership wasn&apos;t cost<br />but instead coordination?</>}
        subheader=""
      />
      <ImpactStatement header="Every year, more than 1.7 million Americans buy a home with family or friends." />
      <HowItWorks header="works" subheader="Your shared home concierge, with you every step of the way." />
      <NoCostSection onOpenChat={handleOpenChat} />
      <AIConciergeSection onOpenChat={handleOpenChat} />
      <AgreementSection />
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
