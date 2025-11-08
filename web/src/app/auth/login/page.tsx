"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth/auth-client";
import Layout from "@/components/new/layout";
import { Card } from "@/components/ui/card";
import { useEffect, useState, Suspense } from "react";
import { redirect, useSearchParams, useRouter } from "next/navigation";
import { LoginForm } from "./_components/login-form";
import { SignupForm } from "./_components/signup-form";
import { ForgotPasswordForm } from "./_components/forgot-password-form";
import { VerifyEmailForm } from "./_components/verify-email-form";

function AuthPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState("login");
    const [verifyEmail, setVerifyEmail] = useState<string>("");
    const [previousSession, setPreviousSession] = useState<any>(null);
    const { data: session, isPending: loading } = authClient.useSession();

    // Helper function to update tab and URL
    const updateTab = (tab: string) => {
        setActiveTab(tab);
        const newUrl = tab === "login" ? "/auth/login" : `/auth/login?tab=${tab}`;
        window.history.replaceState({}, "", newUrl);
    };

    // Check for tab query param
    useEffect(() => {
        const tab = searchParams?.get("tab");
        if (tab && ["login", "signup", "forgot-password", "verify-email"].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Detect sign out and reload page
    useEffect(() => {
        if (previousSession && !session && !loading) {
            // User was signed in but now signed out - reload the page
            window.location.reload();
        }
        setPreviousSession(session);
    }, [session, loading, previousSession]);

    useEffect(() => {
        if (!session && !loading && activeTab === "verify-email") {
            // If no session and on verify-email tab, switch to signup
            updateTab("signup");
        }
    }, [session, activeTab, loading]);

    useEffect(() => {
        if (session && !loading) {
            // If logged in and email is verified, redirect to home
            if (session.user.emailVerified) {
                redirect("/");
            } else if (!session.user.emailVerified && session.user.email) {
                // If logged in but email not verified, show verify email tab
                if (activeTab !== "verify-email") {
                    updateTab("verify-email");
                    setVerifyEmail(session.user.email);
                }
                // Allow user to stay on verify-email tab to verify
            }
        }
    }, [session, activeTab, loading]);

    function handleEmailNotVerified(email: string) {
        updateTab("verify-email");
        setVerifyEmail(email);
    }

    return (
        <Layout>
            <Card className="flex flex-col items-center justify-center w-full max-w-sm">
                <Tabs value={activeTab} onValueChange={updateTab} className="w-full px-4">
                    {activeTab !== "forgot-password" && activeTab !== "verify-email" && (
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                    )}
                    <TabsContent value="login">
                        <LoginForm 
                            setActiveTab={updateTab}
                            onEmailNotVerified={handleEmailNotVerified}
                        />
                    </TabsContent>

                    <TabsContent value="signup">
                        <SignupForm 
                            setActiveTab={updateTab}
                            onEmailNotVerified={handleEmailNotVerified}
                        />
                    </TabsContent>

                    <TabsContent value="forgot-password">
                        <ForgotPasswordForm setActiveTab={updateTab} />
                    </TabsContent>

                    <TabsContent value="verify-email">
                        <VerifyEmailForm 
                            setActiveTab={updateTab}
                            initialEmail={verifyEmail}
                        />
                    </TabsContent>
                </Tabs>
            </Card>
        </Layout>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <Layout>
                <Card className="flex flex-col items-center justify-center w-full max-w-sm">
                    <div className="w-full px-4 py-8 text-center">Loading...</div>
                </Card>
            </Layout>
        }>
            <AuthPageContent />
        </Suspense>
    );
}
