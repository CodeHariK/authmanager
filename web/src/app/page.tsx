"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner";
import Layout from "@/components/new/layout";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmationDialog } from "@/components/new/confirmation-dialog";
import { ProfileCard } from "@/components/auth/profile-card";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { toast } from "sonner";

type SessionItem = {
  createdAt: Date | string;
  updatedAt: Date | string;
  expiresAt: Date | string;
  ipAddress?: string;
  userAgent?: string;
  token: string;
  userId: string;
};

function HomeContent() {
  const searchParams = useSearchParams();
  const { data: session, isPending: loading } = authClient.useSession();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeAllDialogOpen, setRevokeAllDialogOpen] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<SessionItem | null>(null);

  // Handle email verification redirect
  useEffect(() => {
    if (loading) return; // Wait for session to load
    
    const verified = searchParams?.get("verified");
    if (verified) {
      // After email verification, fetch the session with disableCookieCache to bypass Redis cache
      // This forces the server to fetch fresh data from the database
      const fetchUpdatedSession = async () => {
        try {
          const sessionRes = await authClient.getSession({ 
            query: {
              disableCookieCache: true
            }
          });
          
          if (sessionRes?.data?.user?.emailVerified) {
            toast.success("Email verified successfully!");
          }
        } catch (err) {
          console.error("Failed to fetch session after verification:", err);
          toast.error("Email verified, but failed to refresh session");
        } finally {
          // Remove query parameter from URL
          window.history.replaceState({}, "", "/");
          window.location.reload();
        }
      };

      fetchUpdatedSession();
    }
  }, [searchParams, session, loading]);

  useEffect(() => {
    if (session) {
      setLoadingSessions(true);
      authClient.listSessions()
        .then((res) => {
          const sessionList = (res?.data ?? []).map((item: any) => item.session ?? item);
          // Deduplicate sessions by token
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
    <Layout center={session ? false : true}>

      {
        loading 
          ? 
          <Spinner className="size-10" /> 
          :
          (session 
            ? 
            <div className="p-6 space-y-6">
              {/* Email Verification Banner */}
              {!session.user.emailVerified && <EmailVerificationBanner />}

              <ProfileCard user={session.user} />

              <div className="w-full overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Your Sessions</h2>
                  {sessions.length > 1 && session.user.emailVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={revokingAll}
                      onClick={() => setRevokeAllDialogOpen(true)}
                    >
                      {revokingAll ? "Revoking..." : "Revoke All Other Sessions"}
                    </Button>
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
                            const userAgent = s.userAgent ?? "Unknown";
                            const ipAddress = s.ipAddress ?? "-";
                            const createdAt = s.createdAt ? new Date(s.createdAt).toLocaleString() : "-";
                            const expiresAt = s.expiresAt ? new Date(s.expiresAt).toLocaleString() : "-";
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
                                  <div className={isHovered ? "break-words whitespace-normal" : "line-clamp-2 break-words"}>{userAgent}</div>
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
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        setSessionToRevoke(s);
                                        setRevokeDialogOpen(true);
                                      }}
                                    >
                                      Revoke
                                    </Button>
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
            </div>
            : 
            <div className="flex flex-col items-center justify-center">
              <Button asChild size="lg">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          )
      }

      {/* Revoke Session Dialog */}
      <ConfirmationDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        title="Revoke Session"
        description="Are you sure you want to revoke this session? You will be logged out from this device."
        confirmText="Revoke"
        onConfirm={async () => {
          if (!sessionToRevoke) return;
          try {
            await authClient.revokeSession({ token: sessionToRevoke.token });
            setSessions((prev) => prev.filter((ss) => ss.token !== sessionToRevoke.token));
            setRevokeDialogOpen(false);
            setSessionToRevoke(null);
            toast.success("Session revoked successfully");
          } catch (err: any) {
            console.error("Failed to revoke session:", err);
            toast.error(err?.message ?? "Failed to revoke session");
          }
        }}
      />

      {/* Revoke All Other Sessions Dialog */}
      <ConfirmationDialog
        open={revokeAllDialogOpen}
        onOpenChange={setRevokeAllDialogOpen}
        title="Revoke All Other Sessions"
        description="Are you sure you want to revoke all other sessions? You will remain logged in on this device only."
        confirmText="Revoke All"
        loading={revokingAll}
        loadingText="Revoking..."
        onConfirm={async () => {
          try {
            setRevokingAll(true);
            await authClient.revokeOtherSessions();
            const currentSessionToken = session?.session?.token;
            setSessions((prev) => 
              prev.filter((s) => s.token === currentSessionToken)
            );
            setRevokeAllDialogOpen(false);
            toast.success("All other sessions revoked successfully");
          } catch (err: any) {
            console.error("Failed to revoke other sessions:", err);
            toast.error(err?.message ?? "Failed to revoke other sessions");
          } finally {
            setRevokingAll(false);
          }
        }}
      />

    </Layout>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <Layout center={true}>
        <Spinner className="size-10" />
      </Layout>
    }>
      <HomeContent />
    </Suspense>
  );
}
