"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, X, Search, Loader2 } from "lucide-react";
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

  // --- Add Member ---
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; email: string | null; full_name: string | null }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    email: string | null;
    full_name: string | null;
  } | null>(null);
  const [addMemberRole, setAddMemberRole] = useState("member");
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchUsers = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/admin/users?q=${encodeURIComponent(q)}&limit=5`
        );
        if (res.ok) {
          const json = await res.json();
          const existingIds = new Set(
            data?.members.map((m) => m.user_id) ?? []
          );
          setSearchResults(
            (json.users || []).filter(
              (u: { id: string }) => !existingIds.has(u.id)
            )
          );
        }
      } finally {
        setIsSearching(false);
      }
    },
    [data?.members]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedUser(null);
    setAddMemberError(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchUsers(value), 300);
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;
    setActionInProgress("add-member");
    setAddMemberError(null);
    try {
      const res = await fetch(`/api/admin/parties/${partyId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, role: addMemberRole }),
      });
      if (res.ok) {
        await fetchParty();
        setShowAddMember(false);
        setSearchQuery("");
        setSearchResults([]);
        setSelectedUser(null);
        setAddMemberRole("member");
      } else {
        const json = await res.json();
        setAddMemberError(json.error || "Failed to add member");
      }
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
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">
            Members ({members.length})
          </h3>
          {!showAddMember && (
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add Member
            </button>
          )}
        </div>

        {/* Add Member Form */}
        {showAddMember && (
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-start gap-3">
              {/* Search / Selected User */}
              <div className="flex-1 relative">
                {selectedUser ? (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                    <span className="font-medium text-foreground">
                      {selectedUser.full_name || "Unnamed"}
                    </span>
                    <span className="text-muted-foreground">
                      {selectedUser.email}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setSearchQuery("");
                        setAddMemberError(null);
                      }}
                      className="ml-auto text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
                      )}
                    </div>
                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              setSelectedUser(user);
                              setSearchQuery("");
                              setSearchResults([]);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
                          >
                            <span className="font-medium text-foreground">
                              {user.full_name || "Unnamed"}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {user.email}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchQuery.length >= 2 &&
                      !isSearching &&
                      searchResults.length === 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg px-3 py-2 text-sm text-muted-foreground">
                          No users found
                        </div>
                      )}
                  </>
                )}
              </div>

              {/* Role Picker */}
              <select
                value={addMemberRole}
                onChange={(e) => setAddMemberRole(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>

              {/* Actions */}
              <button
                onClick={handleAddMember}
                disabled={!selectedUser || actionInProgress === "add-member"}
                className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {actionInProgress === "add-member" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setSearchQuery("");
                  setSearchResults([]);
                  setSelectedUser(null);
                  setAddMemberError(null);
                }}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
            {addMemberError && (
              <p className="mt-2 text-xs text-red-500">{addMemberError}</p>
            )}
          </div>
        )}

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
