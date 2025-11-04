import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";
import Layout from "@/components/new/layout";
import { HomeContent } from "@/components/auth/home-content";

export default async function Home() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  // Fetch user accounts to check if they have a password account
  let hasPasswordAccount = false;
  let accountsData: any = null;
  if (session) {
    try {
      const accounts = await auth.api.listUserAccounts({
        headers: headersList,
      });
      accountsData = accounts;
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
      <HomeContent initialSession={session || null} hasPasswordAccount={hasPasswordAccount} accountsData={accountsData} />
    </Suspense>
  );
}
