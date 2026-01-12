"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

type AuthMethod = 'email' | 'phone';
type Step = 'input' | 'verify' | 'success';

export function SignupOverlay() {
  const [method, setMethod] = useState<AuthMethod>('email');
  const [step, setStep] = useState<Step>('input');
  const [inputValue, setInputValue] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signInWithEmail, signInWithPhone, verifyOtp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (step === 'input') {
        if (method === 'email') {
          const { error } = await signInWithEmail(inputValue);
          if (error) {
            setError(error.message);
          } else {
            setStep('success');
          }
        } else {
          const { error } = await signInWithPhone(inputValue);
          if (error) {
            setError(error.message);
          } else {
            setStep('verify');
          }
        }
      } else if (step === 'verify') {
        const { error } = await verifyOtp(inputValue, otpCode);
        if (error) {
          setError(error.message);
        } else {
          setStep('success');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('input');
    setInputValue('');
    setOtpCode('');
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 shadow-xl border border-border"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
            <span className="text-2xl">🔓</span>
          </div>
          <h3 className="text-xl font-heading font-bold text-foreground">
            Unlock Premium Tools
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create a free account to access detailed projections
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Method Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => { setMethod('email'); setError(null); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                    method === 'email'
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('phone'); setError(null); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                    method === 'phone'
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Phone className="w-4 h-4" />
                  Phone
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <input
                      type={method === 'email' ? 'email' : 'tel'}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={method === 'email' ? 'you@example.com' : '+1 (555) 000-0000'}
                      className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !inputValue}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {method === 'email' ? 'Send Magic Link' : 'Send Code'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <p className="text-xs text-center text-muted-foreground mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <p className="text-sm text-center text-muted-foreground">
                    Enter the 6-digit code sent to {inputValue}
                  </p>

                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-center text-2xl tracking-widest placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    maxLength={6}
                    required
                  />

                  {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length !== 6}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Verify Code
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Use a different number
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'success' && method === 'email' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-3">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Check your email
              </h4>
              <p className="text-sm text-muted-foreground">
                We sent a magic link to <strong>{inputValue}</strong>. Click it to unlock premium tools.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
