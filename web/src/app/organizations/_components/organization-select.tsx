"use client"

import { authClient } from "@/lib/auth/auth-client"
import { toast } from "sonner"

export function OrganizationSelect() {
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const { data: organizations } = authClient.useListOrganizations()

  if (organizations == null || organizations.length === 0) {
    return null
  }

  function setActiveOrganization(organizationId: string) {
    authClient.organization.setActive(
      { organizationId },
      {
        onError: error => {
          toast.error(error.error.message || "Failed to switch organization")
        },
      }
    )
  }

  return (
    <select
      value={activeOrganization?.id ?? ""}
      onChange={(e) => setActiveOrganization(e.target.value)}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
    >
      <option value="" disabled>
        Select an organization
      </option>
      {organizations.map(org => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  )
}
