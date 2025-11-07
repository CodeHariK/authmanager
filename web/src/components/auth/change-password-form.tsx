"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/new/password-input";
import { Field, FieldContent, FieldLabel, FieldError } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { ActionButtonWithConfirm } from "@/components/new/action-button-with-confirm";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    revokeOtherSessions: z.boolean(),
});

interface ChangePasswordFormProps {
    hasPasswordAccount: boolean;
    userEmail: string;
}

export function ChangePasswordForm({ hasPasswordAccount, userEmail }: ChangePasswordFormProps) {
    const router = useRouter();
    const changePasswordForm = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            revokeOtherSessions: false,
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

            // Revoke other sessions if checkbox is checked
            if (values.revokeOtherSessions) {
                try {
                    await authClient.revokeOtherSessions();
                    toast.success("Password changed successfully and all other sessions revoked");
                } catch (revokeErr: any) {
                    console.error("Failed to revoke other sessions:", revokeErr);
                    toast.success("Password changed successfully, but failed to revoke other sessions");
                }
            } else {
                toast.success("Password changed successfully");
            }

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
                email: userEmail, 
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

    if (hasPasswordAccount) {
        return (
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

                        <Field>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="revokeOtherSessions"
                                    {...changePasswordForm.register("revokeOtherSessions")}
                                    checked={changePasswordForm.watch("revokeOtherSessions")}
                                    onCheckedChange={(checked) => {
                                        changePasswordForm.setValue("revokeOtherSessions", checked === true);
                                    }}
                                />
                                <FieldLabel
                                    htmlFor="revokeOtherSessions"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    Revoke all other sessions
                                </FieldLabel>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ml-6">
                                Sign out from all other devices after changing your password
                            </p>
                        </Field>

                        <Button type="submit" disabled={isChangingPassword || changePasswordForm.formState.isSubmitting}>
                            {isChangingPassword || changePasswordForm.formState.isSubmitting ? "Changing..." : "Change Password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        );
    }

    return (
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
    );
}

export function SetPasswordButton({ email }: { email: string }) {
    const router = useRouter();
    
    return (
        <ActionButtonWithConfirm
            variant="outline"
            action={async () => {
                const result = await authClient.requestPasswordReset({
                    email,
                    redirectTo: "/auth/reset-password",
                });
                
                if (result?.error) {
                    return { success: false, error: result.error.message || "Failed to send password reset email" };
                }
                
                router.push("/auth/reset-password");
                return { success: true, message: "Password reset email sent! Check your inbox." };
            }}
            dialogTitle="Send Password Setup Email"
            dialogDescription="We'll send you a password reset email to set up your password. This will link a password account to your existing account."
            confirmText="Send Email"
            successMessage="Password reset email sent! Check your inbox."
            errorMessage="Failed to send password reset email"
        >
            Send Password Reset Email
        </ActionButtonWithConfirm>
    )
}
