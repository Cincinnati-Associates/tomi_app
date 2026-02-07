"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Compass,
  ClipboardCheck,
  MessageSquare,
  Eye,
  Brain,
  Bot,
  RotateCcw,
  KeyRound,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminHomiChat } from "@/components/admin/AdminHomiChat";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "journey", label: "Journey", icon: Compass },
  { id: "exercises", label: "Exercises", icon: ClipboardCheck },
  { id: "chat", label: "Chat History", icon: MessageSquare },
  { id: "visitor", label: "Visitor Context", icon: Eye },
  { id: "knowledge", label: "UserKnowledge", icon: Brain },
  { id: "admin-homi", label: "Admin Homi", icon: Bot },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface UserDetail {
  profile: {
    id: string;
    email: string | null;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    timezone: string | null;
    role: string;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
  };
  journey: {
    stage: string;
    readiness_score: number | null;
    target_timeline: string | null;
    target_markets: string[];
    budget_range_low: number | null;
    budget_range_high: number | null;
    co_buyer_status: string | null;
  } | null;
  exercises: Array<{
    id: string;
    exercise_id: string;
    status: string;
    computed_scores: Record<string, unknown>;
    version: number;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
  }>;
  partyMemberships: Array<{
    id: string;
    party_id: string;
    role: string;
    invite_status: string;
    joined_at: string;
    buying_parties: { id: string; name: string; status: string } | null;
  }>;
}

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Tab-specific data
  const [exercisesDetailed, setExercisesDetailed] = useState<unknown[] | null>(null);
  const [chatHistory, setChatHistory] = useState<unknown[] | null>(null);
  const [visitorData, setVisitorData] = useState<unknown>(null);
  const [knowledgeData, setKnowledgeData] = useState<{
    knowledge: unknown;
    formatted: string;
  } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        if (res.ok) {
          setUser(await res.json());
        } else if (res.status === 404) {
          router.replace("/admin/users");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [userId, router]);

  // Lazy-load tab data
  useEffect(() => {
    if (!userId) return;

    if (activeTab === "exercises" && !exercisesDetailed) {
      fetch(`/api/admin/users/${userId}/exercises`)
        .then((r) => r.json())
        .then((d) => setExercisesDetailed(d.responses));
    } else if (activeTab === "chat" && !chatHistory) {
      fetch(`/api/admin/users/${userId}/chat-history`)
        .then((r) => r.json())
        .then((d) => setChatHistory(d.conversations));
    } else if (activeTab === "visitor" && !visitorData) {
      fetch(`/api/admin/users/${userId}/visitor-sessions`)
        .then((r) => r.json())
        .then(setVisitorData);
    } else if (activeTab === "knowledge" && !knowledgeData) {
      fetch(`/api/admin/users/${userId}/knowledge`)
        .then((r) => r.json())
        .then(setKnowledgeData);
    }
  }, [activeTab, userId, exercisesDetailed, chatHistory, visitorData, knowledgeData]);

  const handleRoleChange = async (newRole: string) => {
    if (!user) return;
    setActionInProgress("role");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUser({
          ...user,
          profile: { ...user.profile, role: newRole },
        });
      }
    } finally {
      setActionInProgress(null);
    }
  };

  const handlePasswordReset = async () => {
    setActionInProgress("password");
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Password reset sent");
      } else {
        alert(data.error || "Failed to send reset");
      }
    } finally {
      setActionInProgress(null);
    }
  };

  const handleExerciseAction = async (
    responseId: string,
    action: "delete" | "mark_incomplete"
  ) => {
    setActionInProgress(responseId);
    try {
      const method = action === "delete" ? "DELETE" : "PATCH";
      const res = await fetch(
        `/api/admin/users/${userId}/exercises/${responseId}`,
        { method }
      );
      if (res.ok) {
        // Refresh exercises
        const r = await fetch(`/api/admin/users/${userId}/exercises`);
        const d = await r.json();
        setExercisesDetailed(d.responses);
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

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
        <div className="flex items-center gap-4">
          {user.profile.avatar_url ? (
            <img
              src={user.profile.avatar_url}
              alt="Avatar"
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {(user.profile.full_name || user.profile.email || "?")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {user.profile.full_name || user.profile.email || "Unknown User"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user.profile.email} &middot; ID: {user.profile.id.slice(0, 8)}
              ...
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Profile Info</h3>
              <dl className="space-y-3">
                {[
                  ["Name", user.profile.full_name],
                  ["Email", user.profile.email],
                  ["Phone", user.profile.phone],
                  ["Timezone", user.profile.timezone],
                  [
                    "Onboarding",
                    user.profile.onboarding_completed ? "Completed" : "Not completed",
                  ],
                  [
                    "Joined",
                    new Date(user.profile.created_at).toLocaleDateString(),
                  ],
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

            <div className="space-y-6">
              {/* Role Management */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground mb-4">Role</h3>
                <select
                  value={user.profile.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={actionInProgress === "role"}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              {/* Actions */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground mb-4">Actions</h3>
                <button
                  onClick={handlePasswordReset}
                  disabled={actionInProgress === "password"}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <KeyRound className="h-4 w-4" />
                  {actionInProgress === "password"
                    ? "Sending..."
                    : "Send Password Reset"}
                </button>
              </div>

              {/* Party Memberships */}
              {user.partyMemberships.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Party Memberships
                  </h3>
                  <div className="space-y-2">
                    {user.partyMemberships.map((m) => (
                      <Link
                        key={m.id}
                        href={`/admin/parties/${m.party_id}`}
                        className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {m.buying_parties?.name || "Unknown Party"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {m.role} &middot; {m.buying_parties?.status}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Journey Tab */}
        {activeTab === "journey" && (
          <div className="rounded-lg border border-border bg-card p-6">
            {user.journey ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Journey State</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    ["Stage", user.journey.stage],
                    [
                      "Readiness Score",
                      user.journey.readiness_score != null
                        ? `${user.journey.readiness_score}/100`
                        : "—",
                    ],
                    ["Timeline", user.journey.target_timeline || "—"],
                    [
                      "Budget",
                      user.journey.budget_range_low || user.journey.budget_range_high
                        ? `$${(user.journey.budget_range_low || 0).toLocaleString()} - $${(user.journey.budget_range_high || 0).toLocaleString()}`
                        : "—",
                    ],
                    ["Co-buyer Status", user.journey.co_buyer_status || "—"],
                    [
                      "Target Markets",
                      user.journey.target_markets?.length
                        ? user.journey.target_markets.join(", ")
                        : "—",
                    ],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="text-sm font-medium text-foreground capitalize">
                        {(value as string).replace(/_/g, " ")}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No journey data yet</p>
            )}
          </div>
        )}

        {/* Exercises Tab */}
        {activeTab === "exercises" && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {exercisesDetailed === null ? (
              <div className="p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-48" />
              </div>
            ) : exercisesDetailed.length === 0 ? (
              <div className="p-6 text-muted-foreground">
                No exercise responses yet
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Exercise
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Version
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Completed
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(exercisesDetailed as Array<{
                    id: string;
                    exercise_templates: { slug: string; name: string } | null;
                    status: string;
                    version: number;
                    completed_at: string | null;
                  }>).map((resp) => (
                    <tr
                      key={resp.id}
                      className="border-b border-border"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {resp.exercise_templates?.name ||
                          resp.exercise_templates?.slug ||
                          "Unknown"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-xs font-medium",
                            resp.status === "completed"
                              ? "bg-green-500/15 text-green-600 dark:text-green-400"
                              : "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                          )}
                        >
                          {resp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        v{resp.version}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {resp.completed_at
                          ? new Date(resp.completed_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {resp.status === "completed" && (
                            <button
                              onClick={() =>
                                handleExerciseAction(
                                  resp.id,
                                  "mark_incomplete"
                                )
                              }
                              disabled={actionInProgress === resp.id}
                              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted transition-colors disabled:opacity-50"
                              title="Mark as incomplete"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Reset
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleExerciseAction(resp.id, "delete")
                            }
                            disabled={actionInProgress === resp.id}
                            className="flex items-center gap-1 rounded-md border border-red-500/30 px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title="Delete response"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Chat History Tab */}
        {activeTab === "chat" && (
          <div className="space-y-4">
            {chatHistory === null ? (
              <div className="animate-pulse h-32 bg-muted rounded-lg" />
            ) : chatHistory.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
                No chat history
              </div>
            ) : (
              (chatHistory as Array<{
                id: string;
                title: string | null;
                message_count: number;
                last_message_at: string;
                summary: string | null;
                chat_messages: Array<{
                  id: string;
                  role: string;
                  content: string;
                  created_at: string;
                }>;
              }>).map((conv) => (
                <details
                  key={conv.id}
                  className="rounded-lg border border-border bg-card"
                >
                  <summary className="cursor-pointer px-6 py-4 hover:bg-muted/30 transition-colors">
                    <div className="inline-flex items-center gap-4">
                      <span className="font-medium text-foreground">
                        {conv.title || "Untitled Conversation"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {conv.message_count} messages &middot;{" "}
                        {new Date(conv.last_message_at).toLocaleDateString()}
                      </span>
                    </div>
                    {conv.summary && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {conv.summary}
                      </p>
                    )}
                  </summary>
                  <div className="border-t border-border px-6 py-4 space-y-3 max-h-96 overflow-y-auto">
                    {conv.chat_messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "rounded-lg px-4 py-2 text-sm max-w-[80%]",
                          msg.role === "user"
                            ? "bg-primary/10 text-foreground ml-auto"
                            : "bg-muted text-foreground"
                        )}
                      >
                        <p className="text-xs text-muted-foreground mb-1 capitalize">
                          {msg.role}
                        </p>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </details>
              ))
            )}
          </div>
        )}

        {/* Visitor Context Tab */}
        {activeTab === "visitor" && (
          <div className="rounded-lg border border-border bg-card p-6">
            {visitorData === null ? (
              <div className="animate-pulse h-32 bg-muted rounded" />
            ) : (
              <pre className="text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(visitorData, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* UserKnowledge Tab */}
        {activeTab === "knowledge" && (
          <div className="space-y-4">
            {knowledgeData === null ? (
              <div className="animate-pulse h-32 bg-muted rounded-lg" />
            ) : (
              <>
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="font-semibold text-foreground mb-3">
                    Formatted Prompt (what Homi sees)
                  </h3>
                  <pre className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-4 overflow-x-auto">
                    {knowledgeData.formatted}
                  </pre>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="font-semibold text-foreground mb-3">
                    Raw Knowledge Object
                  </h3>
                  <pre className="text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(knowledgeData.knowledge, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}

        {/* Admin Homi Tab */}
        {activeTab === "admin-homi" && (
          <AdminHomiChat
            targetUserId={userId}
            targetUserName={
              user.profile.full_name || user.profile.email || "Unknown User"
            }
          />
        )}
      </div>
    </div>
  );
}
