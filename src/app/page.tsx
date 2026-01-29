"use client";

import { useState } from "react";
import { Hero } from "@/components/home/Hero";
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
      <Hero onOpenChat={handleOpenChat} />
      <UnlockSection />
      <HowItWorks header="Your partner at every stage" />
      <NoCostSection />
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
