"use client"

import { ActionButtonWithConfirm } from "@/components/new/action-button-with-confirm";
import { authClient } from "@/lib/auth/auth-client"
import { useRouter } from "next/navigation"

export function InviteInformation({
  invitation,
}: {
  invitation: { id: string; organizationId: string }
}) {
  const router = useRouter()

  async function acceptInvite() {
    const result = await authClient.organization.acceptInvitation({
      invitationId: invitation.id,
    });

    if (result?.error) {
      return { success: false, error: result.error.message || "Failed to accept invitation" };
    }

    await authClient.organization.setActive({
      organizationId: invitation.organizationId,
    });
    router.push("/organizations");
    return { success: true, message: "Invitation accepted successfully" };
  }

  async function rejectInvite() {
    const result = await authClient.organization.rejectInvitation({
      invitationId: invitation.id,
    });

    if (result?.error) {
      return { success: false, error: result.error.message || "Failed to reject invitation" };
    }

    router.push("/");
    return { success: true, message: "Invitation rejected successfully" };
  }

  return (
    <div className="flex gap-4">
      <ActionButtonWithConfirm
        className="flex-grow"
        action={acceptInvite}
        dialogTitle="Accept Invitation"
        dialogDescription="Are you sure you want to accept this invitation? You will be added to the organization."
        confirmText="Accept"
        successMessage="Invitation accepted successfully"
        errorMessage="Failed to accept invitation"
      >
        Accept
      </ActionButtonWithConfirm>
      <ActionButtonWithConfirm
        className="flex-grow"
        variant="destructive"
        action={rejectInvite}
        dialogTitle="Reject Invitation"
        dialogDescription="Are you sure you want to reject this invitation? This action cannot be undone."
        confirmText="Reject"
        successMessage="Invitation rejected successfully"
        errorMessage="Failed to reject invitation"
      >
        Reject
      </ActionButtonWithConfirm>
    </div>
  )
}
