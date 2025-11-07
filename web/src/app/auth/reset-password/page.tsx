"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import Layout from "@/components/new/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/new/password-input";
import { Field, FieldContent, FieldLabel, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Spinner } from "@/components/ui/spinner";

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isResetting, setIsResetting] = useState(false);
    const [isValidatingToken, setIsValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Extract token from URL
    const token = searchParams?.get("token");
    const tokenHash = searchParams?.get("token_hash");

    useEffect(() => {
        // Check if we have a token or token_hash
        if (token || tokenHash) {
            setTokenValid(true);
            setIsValidatingToken(false);
        } else {
            // No token yet - user might have been redirected here after requesting reset
            // Don't show error, just show message to check email
            setTokenValid(false);
            setIsValidatingToken(false);
        }
    }, [token, tokenHash]);

    async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
        try {
            setIsResetting(true);
            
            // Better-auth might use token or token_hash for password reset
            let result: any;
            
            if (tokenHash) {
                // Use token_hash if available (PKCE flow)
                result = await authClient.resetPassword({
                    newPassword: values.newPassword,
                    token: tokenHash,
                });
            } else if (token) {
                // Use token if available
                result = await authClient.resetPassword({
                    newPassword: values.newPassword,
                    token: token,
                });
            } else {
                toast.error("Invalid reset token");
                return;
            }

            if (result?.error) {
                toast.error(result.error.message || "Failed to reset password");
                return;
            }

            toast.success("Password reset successfully!");
            
            // Redirect to login page after successful reset
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000);
        } catch (err: any) {
            console.error("Failed to reset password:", err);
            toast.error(err?.message || "Failed to reset password");
        } finally {
            setIsResetting(false);
        }
    }

    if (isValidatingToken) {
        return (
            <Layout center={true}>
                <Card className="w-full max-w-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center py-8">
                            <Spinner className="size-8" />
                        </div>
                    </CardContent>
                </Card>
            </Layout>
        );
    }

    if (!tokenValid) {
        return (
            <Layout center={true}>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Password Reset</CardTitle>
                        <CardDescription>
                            {token || tokenHash 
                                ? "The password reset link is invalid or has expired."
                                : "Please check your email for the password reset link and click it to continue."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!(token || tokenHash) && (
                            <div className="text-sm text-muted-foreground">
                                <p>If you haven't received the email:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Check your spam folder</li>
                                    <li>Make sure you used the correct email address</li>
                                    <li>Wait a few minutes and try again</li>
                                </ul>
                            </div>
                        )}
                        <Button onClick={() => router.push("/auth/login")} className="w-full">
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </Layout>
        );
    }

    return (
        <Layout center={true}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Reset Password</CardTitle>
                    <CardDescription>Enter your new password</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <Field data-invalid={!!form.formState.errors.newPassword}>
                            <FieldLabel>New Password</FieldLabel>
                            <FieldContent>
                                <PasswordInput
                                    placeholder="Enter new password"
                                    {...form.register("newPassword")}
                                />
                                <FieldError errors={form.formState.errors.newPassword ? [form.formState.errors.newPassword] : undefined} />
                            </FieldContent>
                        </Field>

                        <Field data-invalid={!!form.formState.errors.confirmPassword}>
                            <FieldLabel>Confirm New Password</FieldLabel>
                            <FieldContent>
                                <PasswordInput
                                    placeholder="Confirm new password"
                                    {...form.register("confirmPassword")}
                                />
                                <FieldError errors={form.formState.errors.confirmPassword ? [form.formState.errors.confirmPassword] : undefined} />
                            </FieldContent>
                        </Field>

                        <Button type="submit" className="w-full" disabled={isResetting || form.formState.isSubmitting}>
                            {isResetting || form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
                        </Button>

                        <div className="text-center text-sm">
                            <button
                                type="button"
                                onClick={() => router.push("/auth/login")}
                                className="text-primary hover:underline"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </Layout>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <Layout center={true}>
                <Card className="w-full max-w-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center py-8">
                            <Spinner className="size-8" />
                        </div>
                    </CardContent>
                </Card>
            </Layout>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}

