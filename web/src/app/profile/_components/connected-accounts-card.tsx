"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ConnectedAccountsCardProps {
    accountsData?: any;
    hasPasswordAccount?: boolean;
}

export function ConnectedAccountsCard({ accountsData, hasPasswordAccount = false }: ConnectedAccountsCardProps) {
    if (!accountsData) {
        return null;
    }

    return (
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
    );
}

