"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { authClient } from "@/lib/auth/auth-client"
import { ActionButtonWithConfirm } from "@/components/new/action-button-with-confirm";
import { CreateInviteButton } from "./create-invite-button"

export function InvitesTab() {
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const pendingInvites = activeOrganization?.invitations?.filter(
    invite => invite.status === "pending"
  )

  async function cancelInvitation(invitationId: string) {
    const result = await authClient.organization.cancelInvitation({ invitationId });

    if (result?.error) {
      return { success: false, error: result.error.message || "Failed to cancel invitation" };
    }

    return { success: true, message: "Invitation cancelled successfully" };
  }

  return (
    <div className="space-y-4">
      <div className="justify-end flex">
        <CreateInviteButton />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingInvites?.map(invitation => (
            <TableRow key={invitation.id}>
              <TableCell>{invitation.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{invitation.role}</Badge>
              </TableCell>
              <TableCell>
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <ActionButtonWithConfirm
                  variant="destructive"
                  size="sm"
                  action={() => cancelInvitation(invitation.id)}
                  dialogTitle="Cancel Invitation"
                  dialogDescription={`Are you sure you want to cancel the invitation sent to ${invitation.email}? This action cannot be undone.`}
                  confirmText="Cancel Invitation"
                  successMessage="Invitation cancelled successfully"
                  errorMessage="Failed to cancel invitation"
                >
                  Cancel
                </ActionButtonWithConfirm>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
