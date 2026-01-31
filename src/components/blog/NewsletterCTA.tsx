"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsletterCTAProps {
  variant?: "default" | "compact";
  title?: string;
  description?: string;
}

export function NewsletterCTA({
  variant = "default",
  title = "Get co-ownership tips delivered to your inbox",
  description = "Join thousands of future co-owners learning how to buy a home with friends and family. No spam, unsubscribe anytime.",
}: NewsletterCTAProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");

    try {
      // TODO: Replace with actual newsletter API endpoint
      // For now, simulate a successful subscription
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Example API call:
      // const res = await fetch('/api/newsletter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      // if (!res.ok) throw new Error('Failed to subscribe');

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-4"
      >
        <p className="mb-3 text-sm font-medium text-foreground">{title}</p>
        {status === "success" ? (
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle className="h-4 w-4" />
            You&apos;re subscribed!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              className="h-9 text-sm"
              disabled={status === "loading"}
            />
            <Button type="submit" size="sm" disabled={status === "loading"}>
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        )}
        {status === "error" && (
          <p className="mt-2 text-xs text-destructive">{errorMessage}</p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border bg-gradient-to-br from-secondary/50 to-card p-8 text-center md:p-12"
    >
      <div className="mx-auto max-w-xl">
        <h3 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          {title}
        </h3>
        <p className="mt-3 text-muted-foreground">{description}</p>

        {status === "success" ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-6 flex items-center justify-center gap-2 text-lg font-medium text-primary"
          >
            <CheckCircle className="h-6 w-6" />
            You&apos;re on the list! Check your inbox.
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                className="h-12 flex-1 text-base"
                disabled={status === "loading"}
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
            {status === "error" && (
              <p className="mt-3 text-sm text-destructive">{errorMessage}</p>
            )}
          </form>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          By subscribing, you agree to our privacy policy. No spam, ever.
        </p>
      </div>
    </motion.div>
  );
}
