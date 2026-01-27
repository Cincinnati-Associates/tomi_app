"use client";

import { useAuthContext } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';
import { User, Home, Settings, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { profile, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'there';

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Welcome, {displayName}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Your co-buying journey starts here.
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Your Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email || profile?.phone || 'Complete your profile'}
                  </p>
                </div>
              </div>
              <Link href="/settings/profile">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {!profile?.onboarding_completed && (
              <div className="mt-4 rounded-lg bg-amber-500/10 p-3">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Complete your profile to get started with co-buying.
                </p>
                <Link href="/settings/profile">
                  <Button size="sm" variant="link" className="mt-1 h-auto p-0 text-amber-600 dark:text-amber-400">
                    Complete profile <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Buying Parties Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Buying Parties</h3>
                  <p className="text-sm text-muted-foreground">
                    Your co-buying groups
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center py-6 rounded-lg border border-dashed border-border">
              <p className="text-sm text-muted-foreground mb-3">
                No buying parties yet
              </p>
              <Link href="/parties/new">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create a Party
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Calculator CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">
                Ready to see what you can afford?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use our calculator to explore co-buying scenarios with potential partners.
              </p>
            </div>
            <Link href="/calc">
              <Button>
                Open Calculator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
