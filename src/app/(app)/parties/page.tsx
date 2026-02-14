"use client";

import { motion } from "framer-motion";
import { Users, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PartiesPage() {
  return (
    <div className="pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Buying Parties
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your co-buying groups
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-12 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No buying parties yet
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create a buying party to start collaborating with potential co-buyers on your journey to homeownership.
          </p>
          <Link href="/parties/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create a Party
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
