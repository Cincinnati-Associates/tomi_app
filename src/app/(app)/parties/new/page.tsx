"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Copy, Check, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/providers/AuthProvider";

interface CreatedParty {
  party: { id: string; name: string };
  inviteUrl: string | null;
  emailSent?: boolean;
  inviteEmail?: string;
}

export default function NewPartyPage() {
  const { isLoading: authLoading } = useAuthContext();

  const [name, setName] = useState("");
  const [targetCity, setTargetCity] = useState("");
  const [targetBudget, setTargetBudget] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedParty | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          targetCity: targetCity.trim() || undefined,
          targetBudget: targetBudget ? Number(targetBudget) : undefined,
          inviteEmail: inviteEmail.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create party");
      }

      const data = await res.json();
      setCreated({
        party: data.party,
        inviteUrl: data.inviteUrl || null,
        emailSent: data.emailSent,
        inviteEmail: inviteEmail.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = () => {
    if (!created?.inviteUrl) return;
    navigator.clipboard.writeText(created.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setName("");
    setTargetCity("");
    setTargetBudget("");
    setInviteEmail("");
    setCreated(null);
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // ── Success view ──────────────────────────────────────────────────
  if (created) {
    return (
      <div className="pb-16">
        <div className="mx-auto max-w-lg px-4 sm:px-6 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Success icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
              <Check className="h-8 w-8 text-primary" />
            </div>

            <h1 className="text-2xl font-heading font-bold text-foreground">
              Your Buying Party is Ready!
            </h1>
            <p className="text-muted-foreground mt-2">
              <span className="font-medium text-foreground">{created.party.name}</span> has been created. You&apos;re the admin.
            </p>

            {/* Email sent confirmation */}
            {created.emailSent && created.inviteEmail && (
              <div className="mt-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
                Invite sent to <strong>{created.inviteEmail}</strong>
              </div>
            )}

            {/* Invite link card */}
            {created.inviteUrl && (
              <div className="mt-8 bg-card rounded-xl border border-border p-6 shadow-sm text-left">
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Invite Link
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground truncate font-mono">
                    {created.inviteUrl}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLink}
                    className="flex-shrink-0 gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  This link expires in 7 days. Anyone with this link can join your party as a member.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <Button asChild className="w-full">
                <Link href="/journey">Go to Your Journey</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleReset}
              >
                Create Another Party
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Form view ─────────────────────────────────────────────────────
  return (
    <div className="pb-16">
      <div className="mx-auto max-w-lg px-4 sm:px-6 pt-8">
        {/* Back link */}
        <Link
          href="/parties"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Parties
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                Start a Buying Party
              </h1>
              <p className="text-sm text-muted-foreground">
                Create your co-buying group and invite your co-owners.
              </p>
            </div>
          </div>

          {/* Form card */}
          <form onSubmit={handleSubmit}>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
              {/* Party name */}
              <div>
                <label
                  htmlFor="party-name"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Party Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="party-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. The Dream Team"
                  required
                  autoFocus
                />
              </div>

              {/* Target city */}
              <div>
                <label
                  htmlFor="target-city"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Target City{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <Input
                  id="target-city"
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  placeholder="e.g. Cincinnati, OH"
                />
              </div>

              {/* Target budget */}
              <div>
                <label
                  htmlFor="target-budget"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Target Budget{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="target-budget"
                    type="number"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(e.target.value)}
                    placeholder="500,000"
                    className="pl-7"
                    min={0}
                  />
                </div>
              </div>

              {/* Invite email */}
              <div>
                <label
                  htmlFor="invite-email"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Invite a Co-Owner by Email{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="cobuyer@example.com"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  They&apos;ll receive an email with a link to join your party.
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={!name.trim() || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Your Buying Party"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
