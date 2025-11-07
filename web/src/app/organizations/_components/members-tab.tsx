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

export function MembersTab() {
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const { data: session } = authClient.useSession()

  async function removeMember(memberId: string) {
    const result = await authClient.organization.removeMember({
      memberIdOrEmail: memberId,
    });

    if (result?.error) {
      return { success: false, error: result.error.message || "Failed to remove member" };
    }

    return { success: true, message: "Member removed successfully" };
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activeOrganization?.members?.map(member => (
          <TableRow key={member.id}>
            <TableCell>{member.user.name}</TableCell>
            <TableCell>{member.user.email}</TableCell>
            <TableCell>
              <Badge
                variant={
                  member.role === "owner"
                    ? "default"
                    : member.role === "admin"
                      ? "secondary"
                      : "outline"
                }
              >
                {member.role}
              </Badge>
            </TableCell>
            <TableCell>
              {member.userId !== session?.user.id && (
                <ActionButtonWithConfirm
                  variant="destructive"
                  size="sm"
                  action={() => removeMember(member.id)}
                  dialogTitle="Remove Member"
                  dialogDescription={`Are you sure you want to remove ${member.user.name} from this organization? This action cannot be undone.`}
                  confirmText="Remove"
                  successMessage="Member removed successfully"
                  errorMessage="Failed to remove member"
                >
                  Remove
                </ActionButtonWithConfirm>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
