"use client"

import { authClient } from "@/lib/auth/auth-client"
import { UserX } from "lucide-react"
import { ActionButtonWithConfirm } from "@/components/new/action-button-with-confirm";
import { useRouter } from "next/navigation"

export function ImpersonationIndicator() {
  const router = useRouter()
  const { data: session, refetch } = authClient.useSession()

  if (session?.session.impersonatedBy == null) return null

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <ActionButtonWithConfirm
        action={async () => {
          const result = await authClient.admin.stopImpersonating();

          if (result?.error) {
            return { success: false, error: result.error.message || "Failed to stop impersonating" };
          }

          router.push("/admin");
          refetch();
          return { success: true, message: "Stopped impersonating successfully" };
        }}
        dialogTitle="Stop Impersonating"
        dialogDescription="Are you sure you want to stop impersonating this user? You will be redirected to the admin page."
        confirmText="Stop Impersonating"
        successMessage="Stopped impersonating successfully"
        errorMessage="Failed to stop impersonating"
        variant="destructive"
        size="sm"
      >
        <UserX className="size-4" />
      </ActionButtonWithConfirm>
    </div>
  )
}
