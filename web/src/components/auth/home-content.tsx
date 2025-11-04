"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Layout from "@/components/new/layout";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { SessionsTab } from "@/components/auth/sessions-tab";
import { ProfileUpdateTab } from "@/components/auth/profile-update-tab";
import { SecurityTab } from "@/components/auth/security-tab";
import { toast } from "sonner";

interface HomeContentProps {
    initialSession: any;
    hasPasswordAccount?: boolean;
    accountsData?: any;
}

export function HomeContent({ initialSession, hasPasswordAccount = false, accountsData }: HomeContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, isPending: loading } = authClient.useSession();
    // Use server-provided session if available, otherwise use client session
    const activeSession = initialSession || session;
    const previousSessionRef = useRef(activeSession);

    // Handle sign out - refresh router when session changes from authenticated to null
    useEffect(() => {
        if (previousSessionRef.current && !activeSession && !loading) {
            // Session was present before but is now null - user signed out
            router.refresh();
        }
        previousSessionRef.current = activeSession;
    }, [activeSession, loading, router]);

    // Handle email verification redirect
    useEffect(() => {
        if (loading && !initialSession) return;
    
        const verified = searchParams?.get("verified");
        if (verified) {
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
                    window.history.replaceState({}, "", "/");
                    router.refresh();
                }
            };

            fetchUpdatedSession();
        }
    }, [searchParams, activeSession, loading, initialSession, router]);

    const isLoading = loading && !initialSession;

    return (
        <Layout center={!activeSession}>
            {isLoading ? (
                <Spinner className="size-10" />
            ) : activeSession ? (
                <div className="p-6 w-full max-w-6xl mx-auto space-y-6">
                    {!activeSession.user.emailVerified && <EmailVerificationBanner />}

                    <Tabs defaultValue="session" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="session">Sessions</TabsTrigger>
                            <TabsTrigger value="profile">Profile Update</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-6">
                            <ProfileUpdateTab session={activeSession} />
                        </TabsContent>

                        <TabsContent value="session" className="space-y-6">
                            <SessionsTab session={activeSession} />
                        </TabsContent>

                        <TabsContent value="security" className="space-y-6">
                            <SecurityTab session={activeSession} hasPasswordAccount={hasPasswordAccount} accountsData={accountsData} />
                        </TabsContent>
                    </Tabs>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <Button asChild size="lg">
                        <Link href="/auth/login">Sign In</Link>
                    </Button>
                </div>
            )}

        </Layout>
    );
}

