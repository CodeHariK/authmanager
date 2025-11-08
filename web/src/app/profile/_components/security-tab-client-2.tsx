"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { SetPasswordButton, ChangePasswordForm } from "./change-password-form";
import { TwoFactorAuth } from "./two-factor-auth"
import { PasskeyManagement } from "./passkey-management";

interface SecurityTab2Props {
    email: string;
    isTwoFactorEnabled: boolean;
    passkeys: any;
    accounts: any;
}

export function SecurityTab2Client({ email, isTwoFactorEnabled, passkeys, accounts }: SecurityTab2Props) {
    const hasPasswordAccount = accounts?.some((a: any) => a.providerId === "credential") ?? false;

    return (
        <div className="space-y-6">
            {hasPasswordAccount ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            Update your password for improved security.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChangePasswordForm 
                            hasPasswordAccount={hasPasswordAccount} 
                            userEmail={email} 
                        />
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Set Password</CardTitle>
                        <CardDescription>
                            We will send you a password reset email to set up a password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SetPasswordButton email={email} />
                    </CardContent>
                </Card>
            )}
            {hasPasswordAccount && (
                <Card>
                    <CardHeader className="flex items-center justify-between gap-2">
                        <CardTitle>Two-Factor Authentication</CardTitle>
                        <Badge variant={isTwoFactorEnabled ? "default" : "secondary"}>
                            {isTwoFactorEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <TwoFactorAuth isEnabled={isTwoFactorEnabled} />
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Passkeys</CardTitle>
                </CardHeader>
                <CardContent>
                    <PasskeyManagement passkeys={passkeys} />
                </CardContent>
            </Card>
        </div>
    );
}

