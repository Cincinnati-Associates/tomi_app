"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const eventTypes = [
  "",
  "user.registered",
  "user.login",
  "user.logout",
  "user.password_reset",
  "user.profile_updated",
  "user.email_verified",
  "admin.role_changed",
  "admin.password_reset_sent",
  "admin.exercise_reset",
  "admin.member_removed",
  "admin.party_status_changed",
];

interface AuditLog {
  id: string;
  event_type: string;
  user_id: string | null;
  email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  retention_days: number | null;
  created_at: string;
}

interface AuditResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminAuditPage() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async (eventType: string, p: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "50" });
      if (eventType) params.set("eventType", eventType);
      const res = await fetch(`/api/admin/audit?${params}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(eventTypeFilter, page);
  }, [eventTypeFilter, page, fetchLogs]);

  const isAdminEvent = (type: string) => type.startsWith("admin.");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data ? `${data.total} total events` : "Loading..."}
        </p>
      </div>

      {/* Event Type Filter */}
      <div className="mb-6">
        <select
          value={eventTypeFilter}
          onChange={(e) => {
            setEventTypeFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">All event types</option>
          {eventTypes
            .filter(Boolean)
            .map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
        </select>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Timestamp
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Event
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  IP
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Metadata
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
              ) : data?.logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No audit logs found
                  </td>
                </tr>
              ) : (
                data?.logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs font-medium",
                          isAdminEvent(log.event_type)
                            ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {log.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {log.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {log.ip_address || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {log.metadata &&
                      Object.keys(log.metadata).length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-xs">View</summary>
                          <pre className="mt-1 text-xs whitespace-pre-wrap max-w-xs">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages, p + 1))
                }
                disabled={page >= data.totalPages}
                className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
