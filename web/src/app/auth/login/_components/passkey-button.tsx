"use client"

import { ActionButtonWithConfirm } from "@/components/new/action-button-with-confirm";
import { authClient } from "@/lib/auth/auth-client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function PasskeyButton() {
  const router = useRouter()
  const { refetch } = authClient.useSession()

  useEffect(() => {
    authClient.signIn.passkey(
      { autoFill: true },
      {
        onSuccess() {
          refetch()
          router.push("/")
        },
      }
    )
  }, [router, refetch])

  return (
    <ActionButtonWithConfirm
      variant="outline"
      className="w-full"
      action={async () => {
        const result = await authClient.signIn.passkey();

        if (result?.error) {
          return { success: false, error: result.error.message || "Failed to sign in with passkey" };
        }

        refetch();
        router.push("/");
        return { success: true, message: "Signed in successfully" };
      }}
      dialogTitle="Sign in with Passkey"
      dialogDescription="You will be prompted to use your passkey to sign in."
      confirmText="Continue"
      successMessage="Signed in successfully"
      errorMessage="Failed to sign in with passkey"
    >
      Use Passkey
    </ActionButtonWithConfirm>
  )
}
