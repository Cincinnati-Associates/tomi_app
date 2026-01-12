"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Person } from './types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  people: Person[];
  showInviteSection?: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  people,
  showInviteSection = false
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const [emailInputs, setEmailInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setSelectedPeople(new Set());
      setEmailInputs({});
    }
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const togglePersonSelection = (personId: string) => {
    const newSelected = new Set(selectedPeople);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
      const newEmails = { ...emailInputs };
      delete newEmails[personId];
      setEmailInputs(newEmails);
    } else {
      newSelected.add(personId);
    }
    setSelectedPeople(newSelected);
  };

  const handleEmailChange = (personId: string, email: string) => {
    setEmailInputs({ ...emailInputs, [personId]: email });
  };

  const handleSendInvites = () => {
    // Placeholder for sending invites
    alert('Email invites coming soon! For now, please share the link directly.');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex justify-between items-center">
          <h2 className="text-2xl font-heading font-bold text-foreground">
            {showInviteSection ? 'Invite Co-Owners' : 'Share Calculator'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Share Link Section */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground mb-3">Share Link</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Anyone with this link can view and edit this calculator
            </p>
            <div className="flex gap-2 items-stretch">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg text-foreground text-sm outline-none min-w-0"
              />
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg border-none cursor-pointer transition-colors hover:bg-primary/90 whitespace-nowrap flex-shrink-0"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Invite Co-Owners Section - Only show if there are people */}
          {people.length > 0 && (
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-heading font-semibold text-foreground mb-3">Invite Co-Owners</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send personalized invites to each co-owner to fill in their financial details
              </p>

              <div className="flex flex-col gap-3">
                {people.map((person, index) => (
                  <div
                    key={person.id}
                    onClick={() => togglePersonSelection(person.id)}
                    className={`rounded-lg p-4 cursor-pointer transition-all border ${
                      selectedPeople.has(person.id)
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex flex-col gap-3 min-w-0">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium text-foreground">{person.name}</span>
                        {index === 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">You</span>
                        )}
                      </div>
                      <AnimatePresence>
                        {selectedPeople.has(person.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="email"
                              placeholder="Enter email address"
                              value={emailInputs[person.id] || ''}
                              onChange={(e) => handleEmailChange(person.id, e.target.value)}
                              className="w-full min-w-0 px-3 py-2 bg-muted border border-border rounded text-foreground text-sm outline-none"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPeople.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSendInvites}
                  className="mt-4 w-full max-w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg border-none cursor-pointer transition-colors hover:bg-primary/90 whitespace-nowrap flex-shrink-0"
                >
                  Send {selectedPeople.size} Invite{selectedPeople.size !== 1 ? 's' : ''} (Coming Soon)
                </motion.button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ShareModal;
