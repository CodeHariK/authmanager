"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/new/password-input";
import { Field, FieldContent, FieldLabel, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

interface SecurityTabProps {
    session: any;
    hasPasswordAccount?: boolean;
    accountsData?: any;
}

export function SecurityTab({ session, hasPasswordAccount = false, accountsData }: SecurityTabProps) {
    const router = useRouter();
    const changePasswordForm = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isRequestingPasswordReset, setIsRequestingPasswordReset] = useState(false);

    async function onChangePassword(values: z.infer<typeof changePasswordSchema>) {
        try {
            setIsChangingPassword(true);
            const result = await authClient.changePassword?.({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });

            if (result?.error) {
                toast.error(result.error.message || "Failed to change password");
                return;
            }

            toast.success("Password changed successfully");
            changePasswordForm.reset();
        } catch (err: any) {
            console.error("Failed to change password:", err);
            toast.error(err?.message || "Failed to change password");
        } finally {
            setIsChangingPassword(false);
        }
    }

    async function onRequestPasswordReset() {
        try {
            setIsRequestingPasswordReset(true);
            const result = await authClient.requestPasswordReset({ 
                email: session.user.email, 
                redirectTo: "/auth/reset-password"
            });

            console.log(result.data, result.error);

            if (result?.error) {
                toast.error(result.error.message || "Failed to send password reset email");
                return;
            }

            toast.success("Password reset email sent! Check your inbox.");
            router.push("/auth/reset-password");
        } catch (err: any) {
            console.error("Failed to request password reset:", err);
            toast.error(err?.message || "Failed to send password reset email");
        } finally {
            setIsRequestingPasswordReset(false);
        }
    }

    return (
        <div className="space-y-6">
            {accountsData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Connected Accounts</CardTitle>
                        <CardDescription>Accounts linked to your profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
                                {JSON.stringify(accountsData, null, 2)}
                            </pre>
                            <p className="text-xs text-muted-foreground">
                                hasPasswordAccount: {hasPasswordAccount ? "true" : "false"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {hasPasswordAccount ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your password to keep your account secure</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={changePasswordForm.handleSubmit(onChangePassword)} className="space-y-4">
                            <Field data-invalid={!!changePasswordForm.formState.errors.currentPassword}>
                                <FieldLabel>Current Password</FieldLabel>
                                <FieldContent>
                                    <PasswordInput
                                        placeholder="Enter current password"
                                        {...changePasswordForm.register("currentPassword")}
                                    />
                                    <FieldError errors={changePasswordForm.formState.errors.currentPassword ? [changePasswordForm.formState.errors.currentPassword] : undefined} />
                                </FieldContent>
                            </Field>

                            <Field data-invalid={!!changePasswordForm.formState.errors.newPassword}>
                                <FieldLabel>New Password</FieldLabel>
                                <FieldContent>
                                    <PasswordInput
                                        placeholder="Enter new password"
                                        {...changePasswordForm.register("newPassword")}
                                    />
                                    <FieldError errors={changePasswordForm.formState.errors.newPassword ? [changePasswordForm.formState.errors.newPassword] : undefined} />
                                </FieldContent>
                            </Field>

                            <Field data-invalid={!!changePasswordForm.formState.errors.confirmPassword}>
                                <FieldLabel>Confirm New Password</FieldLabel>
                                <FieldContent>
                                    <PasswordInput
                                        placeholder="Confirm new password"
                                        {...changePasswordForm.register("confirmPassword")}
                                    />
                                    <FieldError errors={changePasswordForm.formState.errors.confirmPassword ? [changePasswordForm.formState.errors.confirmPassword] : undefined} />
                                </FieldContent>
                            </Field>

                            <Button type="submit" disabled={isChangingPassword || changePasswordForm.formState.isSubmitting}>
                                {isChangingPassword || changePasswordForm.formState.isSubmitting ? "Changing..." : "Change Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Link Password Account</CardTitle>
                        <CardDescription>
                            Add email/password login to your account. You can sign in with either Google or email/password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                We'll send you a password reset email to set up your password. This will link a password account to your existing account.
                            </p>
                            <Button 
                                onClick={onRequestPasswordReset}
                                disabled={isRequestingPasswordReset}
                            >
                                {isRequestingPasswordReset ? "Sending..." : "Send Password Setup Email"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
