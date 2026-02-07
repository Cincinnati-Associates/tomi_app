"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PartyDetail {
  party: {
    id: string;
    name: string;
    status: string;
    target_city: string | null;
    target_budget: string | null;
    calculator_state: unknown;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
  members: Array<{
    id: string;
    user_id: string;
    role: string;
    invite_status: string;
    ownership_percentage: string | null;
    down_payment_contribution: string | null;
    monthly_contribution: string | null;
    joined_at: string;
    profiles: {
      id: string;
      email: string | null;
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  }>;
  invites: Array<{
    id: string;
    invite_type: string;
    invite_value: string;
    role: string;
    expires_at: string;
    accepted_at: string | null;
    created_at: string;
  }>;
}

const validStatuses = [
  "forming",
  "active",
  "under_contract",
  "closed",
  "archived",
];

export default function AdminPartyDetailPage() {
  const { partyId } = useParams<{ partyId: string }>();
  const router = useRouter();
  const [data, setData] = useState<PartyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchParty = async () => {
    try {
      const res = await fetch(`/api/admin/parties/${partyId}`);
      if (res.ok) {
        setData(await res.json());
      } else if (res.status === 404) {
        router.replace("/admin/parties");
      }
    } catch (error) {
      console.error("Failed to fetch party:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParty();
  }, [partyId]);

  const handleStatusChange = async (newStatus: string) => {
    setActionInProgress("status");
    try {
      const res = await fetch(`/api/admin/parties/${partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok && data) {
        setData({
          ...data,
          party: { ...data.party, status: newStatus },
        });
      }
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member from the party?")) return;
    setActionInProgress(memberId);
    try {
      const res = await fetch(
        `/api/admin/parties/${partyId}/members/${memberId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        await fetchParty();
      }
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMemberRoleChange = async (memberId: string, role: string) => {
    setActionInProgress(memberId);
    try {
      await fetch(`/api/admin/parties/${partyId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      await fetchParty();
    } finally {
      setActionInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { party, members, invites } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/parties"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Parties
        </Link>
        <h1 className="text-2xl font-bold text-foreground">{party.name}</h1>
        <p className="text-sm text-muted-foreground">
          ID: {party.id.slice(0, 8)}... &middot; Created{" "}
          {new Date(party.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Party Info */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Party Info</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd>
                <select
                  value={party.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={actionInProgress === "status"}
                  className="mt-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  {validStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </dd>
            </div>
            {[
              ["City", party.target_city],
              [
                "Budget",
                party.target_budget
                  ? `$${Number(party.target_budget).toLocaleString()}`
                  : null,
              ],
              ["Notes", party.notes],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-sm text-foreground">
                  {(value as string) || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Calculator State */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-3">
            Calculator State
          </h3>
          {party.calculator_state ? (
            <pre className="text-xs text-foreground overflow-x-auto whitespace-pre-wrap bg-muted/50 rounded-lg p-3">
              {JSON.stringify(party.calculator_state, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">No calculator data</p>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="rounded-lg border border-border bg-card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">
            Members ({members.length})
          </h3>
        </div>
        {members.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground">
            No members
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Ownership
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Joined
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-border">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${m.user_id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {m.profiles?.full_name || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {m.profiles?.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={m.role}
                      onChange={(e) =>
                        handleMemberRoleChange(m.id, e.target.value)
                      }
                      disabled={actionInProgress === m.id}
                      className="rounded border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="admin">admin</option>
                      <option value="member">member</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {m.ownership_percentage
                      ? `${m.ownership_percentage}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(m.joined_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      disabled={actionInProgress === m.id}
                      className="flex items-center gap-1 rounded-md border border-red-500/30 px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invites */}
      {invites.length > 0 && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">
              Invite History ({invites.length})
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Type
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Value
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => (
                <tr key={inv.id} className="border-b border-border">
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {inv.invite_type}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {inv.invite_value}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {inv.role}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        inv.accepted_at
                          ? "bg-green-500/15 text-green-600 dark:text-green-400"
                          : new Date(inv.expires_at) < new Date()
                            ? "bg-red-500/15 text-red-600 dark:text-red-400"
                            : "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                      )}
                    >
                      {inv.accepted_at
                        ? "Accepted"
                        : new Date(inv.expires_at) < new Date()
                          ? "Expired"
                          : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
