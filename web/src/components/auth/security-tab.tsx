import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { ConnectedAccountsCard } from "@/components/auth/connected-accounts-card";
import { DeleteAccountCard } from "@/components/auth/delete-account-card";
import { TwoFactorAuth } from "@/components/auth/two-factor-auth"
import { AccountLinking } from "@/components/auth/account-linking";
import { SetPasswordButton } from "@/components/auth/change-password-form";
import { Badge } from "@/components/ui/badge";
import { PasskeyManagement } from "@/components/auth/passkey-management";

export async function SecurityTab2({
    email,
    isTwoFactorEnabled,
}: {
    email: string
    isTwoFactorEnabled: boolean
}) {
    const [passkeys, accounts] = await Promise.all([
        auth.api.listPasskeys({ headers: await headers() }),
        auth.api.listUserAccounts({ headers: await headers() }),
    ])
  
    const hasPasswordAccount = accounts.some(a => a.providerId === "credential")
  
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
    )
}


interface SecurityTabProps {
    session: any;
    hasPasswordAccount?: boolean;
    accountsData?: any;
}


export function SecurityTab({ session, hasPasswordAccount = false, accountsData }: SecurityTabProps) {
    return (
        <div className="space-y-6">
            <ConnectedAccountsCard 
                accountsData={accountsData} 
                hasPasswordAccount={hasPasswordAccount} 
            />
            <ChangePasswordForm 
                hasPasswordAccount={hasPasswordAccount} 
                userEmail={session.user.email} 
            />
            <TwoFactorAuth isEnabled={session.user.twoFactorEnabled} />
            <DeleteAccountCard />
        </div>
    );
}

async function LinkedAccountsTab() {
    const accounts = await auth.api.listUserAccounts({ headers: await headers() })
    const nonCredentialAccounts = accounts.filter(
        a => a.providerId !== "credential"
    )
  
    return (
        <Card>
            <CardContent>
                <AccountLinking currentAccounts={nonCredentialAccounts} />
            </CardContent>
        </Card>
    )
}
