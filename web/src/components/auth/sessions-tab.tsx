"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActionButtonWithConfirm } from "@/components/new/action-button-with-confirm";

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Session } from "better-auth"
import { Monitor, Smartphone, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { UAParser } from "ua-parser-js"

function getBrowserInformation(userAgent: string | undefined | null) {
  if (!userAgent) return "Unknown Device";
  const userAgentInfo = UAParser(userAgent);
  if (userAgentInfo.browser.name == null && userAgentInfo.os.name == null) {
    return "Unknown Device";
  }
  if (userAgentInfo.browser.name == null) return userAgentInfo.os.name || "Unknown Device";
  if (userAgentInfo.os.name == null) return userAgentInfo.browser.name || "Unknown Device";
  return `${userAgentInfo.browser.name}, ${userAgentInfo.os.name}`;
}

function formatDate(date: Date | string | undefined | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

type SessionItem = {
  id?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  expiresAt: Date | string;
  ipAddress?: string;
  userAgent?: string;
  token: string;
  userId: string;
};

interface SessionsTabProps {
  session: any;
}

export function SessionsTab({ session }: SessionsTabProps) {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setLoadingSessions(true);
      authClient.listSessions()
        .then((res) => {
          const sessionList = (res?.data ?? []).map((item: any) => item.session ?? item);
          const uniqueSessions = Array.from(
            new Map(sessionList.map((s: SessionItem) => [s.token, s])).values()
          );
          setSessions(uniqueSessions);
        })
        .catch((err) => {
          console.error("Failed to fetch sessions:", err);
        })
        .finally(() => {
          setLoadingSessions(false);
        });
    }
  }, [session]);

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Sessions</h2>
          {sessions.length > 1 && session.user.emailVerified && (
            <ActionButtonWithConfirm
              variant="outline"
              size="sm"
              action={async () => {
                await authClient.revokeOtherSessions();
                const currentSessionToken = session?.session?.token;
                setSessions((prev) => 
                  prev.filter((s) => s.token === currentSessionToken)
                );
                return { success: true, message: "All other sessions revoked successfully" };
              }}
              dialogTitle="Revoke All Other Sessions"
              dialogDescription="Are you sure you want to revoke all other sessions? You will remain logged in on this device only."
              confirmText="Revoke All"
              successMessage="All other sessions revoked successfully"
              errorMessage="Failed to revoke other sessions"
            >
              Revoke All Other Sessions
            </ActionButtonWithConfirm>
          )}
          {sessions.length > 1 && !session.user.emailVerified && (
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Verify your email to manage sessions"
            >
              Verify Email to Manage Sessions
            </Button>
          )}
        </div>
        {loadingSessions ? (
          <Spinner className="size-6" />
        ) : (
          <div className="w-full max-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="max-w-[500px] whitespace-normal">Device</TableHead>
                  <TableHead className="max-w-[120px] whitespace-normal">IP Address</TableHead>
                  <TableHead className="max-w-[180px] whitespace-normal">Created</TableHead>
                  <TableHead className="max-w-[180px] whitespace-normal">Expires</TableHead>
                  <TableHead className="max-w-[100px] whitespace-normal">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow key="empty">
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No sessions found
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((s) => {
                    const browserInfo = getBrowserInformation(s.userAgent);
                    const ipAddress = s.ipAddress ?? "-";
                    const createdAt = formatDate(s.createdAt);
                    const expiresAt = formatDate(s.expiresAt);
                    const isHovered = hoveredRow === s.token;
                    const isCurrentSession = session?.session?.token === s.token;
                    return (
                      <TableRow 
                        key={s.token}
                        className={`transition-all ${isCurrentSession ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}
                        onMouseEnter={() => setHoveredRow(s.token)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <TableCell className="max-w-[500px] whitespace-normal">
                          <div className={isHovered ? "break-words whitespace-normal" : "line-clamp-2 break-words"}>{browserInfo}</div>
                        </TableCell>
                        <TableCell className="max-w-[120px] whitespace-normal">
                          <div className={isHovered ? "break-words whitespace-normal" : "line-clamp-2 break-words"}>{ipAddress}</div>
                        </TableCell>
                        <TableCell className="max-w-[180px] whitespace-normal">
                          <div className={isHovered ? "break-words whitespace-normal" : "line-clamp-2 break-words"}>{createdAt}</div>
                        </TableCell>
                        <TableCell className="max-w-[180px] whitespace-normal">
                          <div className={isHovered ? "break-words whitespace-normal" : "line-clamp-2 break-words"}>{expiresAt}</div>
                        </TableCell>
                        <TableCell className="max-w-[100px] whitespace-normal">
                          {!isCurrentSession && session.user.emailVerified && (
                            <ActionButtonWithConfirm
                              variant="destructive"
                              size="sm"
                              action={async () => {
                                await authClient.revokeSession({ token: s.token });
                                setSessions((prev) => prev.filter((ss) => ss.token !== s.token));
                                return { success: true, message: "Session revoked successfully" };
                              }}
                              dialogTitle="Revoke Session"
                              dialogDescription="Are you sure you want to revoke this session? You will be logged out from this device."
                              confirmText="Revoke"
                              successMessage="Session revoked successfully"
                              errorMessage="Failed to revoke session"
                            >
                              Revoke
                            </ActionButtonWithConfirm>
                          )}
                          {!isCurrentSession && !session.user.emailVerified && (
                            <span className="text-xs text-muted-foreground">Verify email</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

      </div>
    </>
  );
}

