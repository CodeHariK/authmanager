"use client";

import { ChangePasswordForm } from "./change-password-form";
import { ConnectedAccountsCard } from "./connected-accounts-card";
import { DeleteAccountCard } from "./delete-account-card";
import { TwoFactorAuth } from "./two-factor-auth"

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

