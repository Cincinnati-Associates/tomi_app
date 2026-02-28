"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

interface EmailStats {
  last7Days: number;
  last30Days: number;
  allTime: number;
  sent: number;
  failed: number;
  skipped: number;
  bounced: number;
  byType: { emailType: string; count: number }[];
}

interface EmailSend {
  id: string;
  email_type: string;
  to_address: string;
  subject: string;
  status: string;
  resend_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

interface EmailSequence {
  id: string;
  email_type: string;
  to_address: string;
  scheduled_for: string;
  status: string;
  cancel_condition: Record<string, unknown> | null;
  created_at: string;
}

interface PaginatedSends {
  sends: EmailSend[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedSequences {
  sequences: EmailSequence[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =============================================================================
// Stat Card
// =============================================================================

function StatCard({
  label,
  value,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  variant?: "default" | "success" | "danger" | "warning";
}) {
  const colors = {
    default: "text-muted-foreground",
    success: "text-green-600 dark:text-green-400",
    danger: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", colors[variant])} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

// =============================================================================
// Page
// =============================================================================

interface PreviewType {
  type: string;
  label: string;
  subject: string;
}

type Tab = "log" | "sequences" | "preview";

export default function AdminEmailsPage() {
  const [tab, setTab] = useState<Tab>("log");
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [sends, setSends] = useState<PaginatedSends | null>(null);
  const [sequences, setSequences] = useState<PaginatedSequences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logPage, setLogPage] = useState(1);
  const [seqPage, setSeqPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Preview state
  const [previewTypes, setPreviewTypes] = useState<PreviewType[]>([]);
  const [selectedPreview, setSelectedPreview] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch stats
  useEffect(() => {
    fetch("/api/admin/emails/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  // Fetch send log
  const fetchSends = useCallback(
    async (p: number) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p), limit: "50" });
        if (typeFilter) params.set("type", typeFilter);
        if (statusFilter) params.set("status", statusFilter);
        const res = await fetch(`/api/admin/emails?${params}`);
        if (res.ok) setSends(await res.json());
      } finally {
        setIsLoading(false);
      }
    },
    [typeFilter, statusFilter]
  );

  // Fetch sequences
  const fetchSequences = useCallback(async (p: number) => {
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: "50",
        status: "scheduled",
      });
      const res = await fetch(`/api/admin/emails/sequences?${params}`);
      if (res.ok) setSequences(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (tab === "log") fetchSends(logPage);
  }, [tab, logPage, fetchSends]);

  useEffect(() => {
    if (tab === "sequences") fetchSequences(seqPage);
  }, [tab, seqPage, fetchSequences]);

  // Fetch preview types list
  useEffect(() => {
    if (tab === "preview" && previewTypes.length === 0) {
      fetch("/api/admin/emails/preview")
        .then((r) => r.json())
        .then((d) => {
          setPreviewTypes(d.types || []);
          if (d.types?.length > 0 && !selectedPreview) {
            setSelectedPreview(d.types[0].type);
          }
        })
        .catch(console.error);
    }
  }, [tab, previewTypes.length, selectedPreview]);

  // Render preview when template selection changes
  useEffect(() => {
    if (!selectedPreview || tab !== "preview") return;
    setPreviewLoading(true);
    setPreviewHtml("");
    setTestResult(null);
    fetch("/api/admin/emails/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: selectedPreview }),
    })
      .then((r) => r.json())
      .then((d) => {
        setPreviewHtml(d.html || "");
        setPreviewSubject(d.subject || "");
      })
      .catch(console.error)
      .finally(() => setPreviewLoading(false));
  }, [selectedPreview, tab]);

  const handleSendTest = async () => {
    if (!testEmail.trim() || !selectedPreview || testSending) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/emails/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedPreview, sendTo: testEmail.trim() }),
      });
      const data = await res.json();
      setTestResult({
        success: data.sent,
        message: data.sent
          ? `Test sent to ${testEmail.trim()}`
          : data.error || "Failed to send",
      });
    } catch {
      setTestResult({ success: false, message: "Network error" });
    } finally {
      setTestSending(false);
    }
  };

  const handleCancelSequence = async (id: string) => {
    if (!confirm("Cancel this scheduled email?")) return;
    const res = await fetch(`/api/admin/emails/sequences/${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchSequences(seqPage);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      sent: "bg-green-500/15 text-green-600 dark:text-green-400",
      failed: "bg-red-500/15 text-red-600 dark:text-red-400",
      pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      skipped: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
      bounced: "bg-red-500/15 text-red-600 dark:text-red-400",
      scheduled: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      cancelled: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
      delivered: "bg-green-500/15 text-green-600 dark:text-green-400",
      opened: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      clicked: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
    };
    return (
      <span
        className={cn(
          "rounded-md px-2 py-0.5 text-xs font-medium",
          map[status] || "bg-muted text-muted-foreground"
        )}
      >
        {status}
      </span>
    );
  };

  const emailTypes = [
    "",
    "party_invite",
    "welcome",
    "assessment_results",
    "lead_nurture_1",
    "lead_nurture_2",
    "lead_nurture_3",
    "onboarding_nudge",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Email Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor email sends, sequences, and delivery status.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Last 7 days"
            value={stats.last7Days}
            icon={Mail}
          />
          <StatCard
            label="Sent (30d)"
            value={stats.sent}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            label="Failed (30d)"
            value={stats.failed}
            icon={AlertCircle}
            variant="danger"
          />
          <StatCard
            label="All time"
            value={stats.allTime}
            icon={Clock}
          />
        </div>
      )}

      {/* By Type Summary */}
      {stats && stats.byType.length > 0 && (
        <div className="mb-8 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            By Type (Last 30 Days)
          </h2>
          <div className="flex flex-wrap gap-3">
            {stats.byType.map((t) => (
              <div
                key={t.emailType}
                className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5"
              >
                <span className="text-xs text-muted-foreground">
                  {t.emailType.replace(/_/g, " ")}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {t.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        <button
          onClick={() => setTab("log")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            tab === "log"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Send Log
        </button>
        <button
          onClick={() => setTab("sequences")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            tab === "sequences"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Sequence Queue
          {sequences && sequences.total > 0 && (
            <span className="ml-2 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-xs">
              {sequences.total}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("preview")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
            tab === "preview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Preview &amp; Test
        </button>
      </div>

      {/* Send Log Tab */}
      {tab === "log" && (
        <>
          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setLogPage(1);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">All types</option>
              {emailTypes
                .filter(Boolean)
                .map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setLogPage(1);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {["pending", "sent", "failed", "skipped", "bounced", "delivered", "opened", "clicked"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Recipient
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Subject
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Sent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : sends?.sends.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No emails found
                      </td>
                    </tr>
                  ) : (
                    sends?.sends.map((send) => (
                      <tr
                        key={send.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-foreground">
                          {send.to_address}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {send.email_type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                          {send.subject}
                        </td>
                        <td className="px-4 py-3">
                          {statusBadge(send.status)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                          {send.sent_at
                            ? new Date(send.sent_at).toLocaleString()
                            : new Date(send.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {sends && sends.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Page {sends.page} of {sends.totalPages} ({sends.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                    disabled={logPage <= 1}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setLogPage((p) => Math.min(sends.totalPages, p + 1))
                    }
                    disabled={logPage >= sends.totalPages}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Preview & Test Tab */}
      {tab === "preview" && (
        <div className="space-y-6">
          {/* Template selector + test send */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Template picker */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Template
                </label>
                <select
                  value={selectedPreview}
                  onChange={(e) => setSelectedPreview(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {previewTypes.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test send */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Send test to
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendTest();
                    }}
                  />
                  <button
                    onClick={handleSendTest}
                    disabled={!testEmail.trim() || testSending}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {testSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Subject line */}
            {previewSubject && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-medium text-foreground">{previewSubject}</span>
              </div>
            )}

            {/* Test result */}
            {testResult && (
              <div
                className={cn(
                  "mt-3 rounded-lg px-4 py-2.5 text-sm",
                  testResult.success
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                {testResult.success ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    {testResult.message}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    {testResult.message}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Rendered preview */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/50">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Email Preview
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                Rendered with sample data
              </span>
            </div>
            {previewLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                title="Email preview"
                className="w-full border-0"
                style={{ minHeight: "700px" }}
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="py-20 text-center text-muted-foreground text-sm">
                Select a template to preview
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sequences Tab */}
      {tab === "sequences" && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Recipient
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Scheduled For
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Cancel Condition
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {sequences?.sequences.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No scheduled sequences
                    </td>
                  </tr>
                ) : (
                  sequences?.sequences.map((seq) => (
                    <tr
                      key={seq.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-foreground">
                        {seq.to_address}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {seq.email_type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                        {new Date(seq.scheduled_for).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {seq.cancel_condition
                          ? (seq.cancel_condition as { type?: string }).type || "—"
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleCancelSequence(seq.id)}
                          className="flex items-center gap-1 rounded-md border border-red-200 dark:border-red-800 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <XCircle className="h-3 w-3" />
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {sequences && sequences.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Page {sequences.page} of {sequences.totalPages} (
                {sequences.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSeqPage((p) => Math.max(1, p - 1))}
                  disabled={seqPage <= 1}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    setSeqPage((p) =>
                      Math.min(sequences.totalPages, p + 1)
                    )
                  }
                  disabled={seqPage >= sequences.totalPages}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
