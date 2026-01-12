"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CalculatorNavProps {
  onShare: () => void;
}

const CalculatorNav: React.FC<CalculatorNavProps> = ({ onShare }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  return (
    <>
      {/* Desktop: Sticky right sidebar, positioned between content and viewport edge */}
      <div className="hidden lg:flex fixed right-[max(1rem,calc((100vw-80rem)/4))] top-1/2 -translate-y-1/2 z-40 flex-col gap-3">
        <button
          onClick={() => setShowSaveModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-card text-primary border-2 border-primary rounded-full font-semibold cursor-pointer transition-all hover:bg-primary/10 shadow-lg min-w-[120px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v3h8V6z" />
          </svg>
          Save
        </button>

        <button
          onClick={() => setShowContactModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-card text-primary border-2 border-primary rounded-full font-semibold cursor-pointer transition-all hover:bg-primary/10 shadow-lg min-w-[120px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          Contact
        </button>

        <button
          onClick={onShare}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground border-2 border-primary rounded-full font-semibold cursor-pointer transition-all hover:bg-primary/90 shadow-lg min-w-[120px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          Share
        </button>
      </div>

      {/* Mobile: Fixed bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 safe-area-pb">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setShowSaveModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-card text-primary border border-primary rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-primary/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v3h8V6z" />
            </svg>
            Save
          </button>

          <button
            onClick={() => setShowContactModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-card text-primary border border-primary rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-primary/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            Contact
          </button>

          <button
            onClick={onShare}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-primary/90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share
          </button>
        </div>
      </div>

      {/* Contact Us Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowContactModal(false)}>
          <motion.div
            className="bg-card rounded-xl p-8 max-w-md mx-4 border border-border"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">Get in Touch</h3>
              <p className="text-muted-foreground mb-6">
                We&apos;d love to hear from you! Choose how you&apos;d like to connect:
              </p>

              <div className="space-y-3">
                <a
                  href="mailto:contact@livetomi.com"
                  className="block px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg transition-colors hover:bg-primary/90 no-underline"
                >
                  📧 Email Us
                </a>

                <a
                  href="tel:+14155345258"
                  className="block px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg transition-colors hover:bg-primary/90 no-underline"
                >
                  📱 Call/Text: (415) 534-5258
                </a>

                <button
                  onClick={() => setShowContactModal(false)}
                  className="mt-4 px-6 py-2 bg-transparent border border-border text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Save Modal (Coming Soon) */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSaveModal(false)}>
          <motion.div
            className="bg-card rounded-xl p-8 max-w-md mx-4 border border-border"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">Coming Soon!</h3>
              <p className="text-muted-foreground mb-6">
                Save functionality is currently in development.
                For now, you can share your calculator via the Share button.
              </p>
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg border-none cursor-pointer transition-colors hover:bg-primary/90"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default CalculatorNav;
