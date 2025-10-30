"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button"
import Link from "next/link";

export default function Home() {

  const { data: session, isPending: loading } = authClient.useSession.value;

  if (loading) return <div>Loading...
    <p className="text-sm text-gray-500">Session: {JSON.stringify(session)}</p>
  </div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen">

      {
        session 
          ? 
          <div>
            <h1 className="text-2xl font-bold">Home</h1>
            <p className="text-sm text-gray-500">Welcome to the home page</p>
            <p className="text-sm text-gray-500">Session: {JSON.stringify(session)}</p>
            
            <Button size="lg" variant="destructive" 
              onClick={() => authClient.signOut()}>Sign Out
            </Button>

          </div>
          : 
          <div>
            <h1 className="text-2xl font-bold">Home</h1>
            <p className="text-sm text-gray-500">Welcome to the home page</p>
            <p className="text-sm text-gray-500">Session: {JSON.stringify(session)}</p>
            <Button asChild size="lg">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
      }   

    </div>
  )
} 