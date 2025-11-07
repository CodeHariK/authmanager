"use client";

import { authClient } from "@/lib/auth/auth-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ActionButtonWithConfirm } from "@/components/new/action-button-with-confirm";

export function DeleteAccountCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Delete Account</CardTitle>
                <CardDescription>
                    Permanently delete your account and all associated data. You will receive a confirmation email to complete the deletion.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ActionButtonWithConfirm
                    variant="destructive"
                    action={async () => {
                        await authClient.deleteUser({ callbackURL: "/" });
                        return { success: true, message: "Account deletion initiated. Please check your email to confirm." };
                    }}
                    dialogTitle="Delete Account"
                    dialogDescription="Are you absolutely sure you want to delete your account? This will permanently delete all your data and cannot be undone. You will receive a confirmation email to complete the deletion."
                    confirmText="Delete Account"
                    cancelText="Cancel"
                    confirmVariant="destructive"
                    successMessage="Account deletion initiated. Please check your email to confirm."
                    errorMessage="Failed to initiate account deletion"
                >
                    Delete Account
                </ActionButtonWithConfirm>
            </CardContent>
        </Card>
    );
}

