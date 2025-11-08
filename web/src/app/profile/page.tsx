import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { Spinner } from "@/components/ui/spinner";
import Layout from "@/components/new/layout";
import { Card, CardContent } from "@/components/ui/card";

import { ProfileContent } from "./_components/profile-content";

export default async function ProfilePage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  // Fetch user accounts to check if they have a password account
  let hasPasswordAccount = false;
  let accountsData: any = null;
  let passkeysData: any = null;
  if (session) {
    try {
      const [accounts, passkeys] = await Promise.all([
        auth.api.listUserAccounts({
          headers: headersList,
        }),
        auth.api.listPasskeys({
          headers: headersList,
        }),
      ]);
      accountsData = accounts;
      passkeysData = passkeys;
      console.log("listUserAccounts response:", JSON.stringify(accounts, null, 2));
      hasPasswordAccount = accounts?.some((account: any) => account.providerId === "credential") ?? false;
    } catch (err) {
      console.error("Failed to fetch user accounts:", err);
    }
  }

  return (
    <Suspense fallback={
      <Layout center={true}>
        <Spinner className="size-10" />
      </Layout>
    }>
      <ProfileContent initialSession={session || null} hasPasswordAccount={hasPasswordAccount} accountsData={accountsData} passkeysData={passkeysData} />
    </Suspense>
  );
}
