"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"
import { useState } from "react"

const createInviteSchema = z.object({
  email: z.email().min(1).trim(),
  role: z.enum(["member", "admin"]),
})

type CreateInviteForm = z.infer<typeof createInviteSchema>

export function CreateInviteButton() {
  const [open, setOpen] = useState(false)

  const form = useForm<CreateInviteForm>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  })

  const { isSubmitting } = form.formState

  async function handleCreateInvite(data: CreateInviteForm) {
    await authClient.organization.inviteMember(data, {
      onError: error => {
        toast.error(error.error.message || "Failed to invite user")
      },
      onSuccess: () => {
        form.reset()
        setOpen(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Invite a user to collaborate with your team.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(handleCreateInvite)}
        >
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel>Email</FieldLabel>
            <FieldContent>
              <Input type="email" {...form.register("email")} />
              <FieldError errors={form.formState.errors.email ? [form.formState.errors.email] : undefined} />
            </FieldContent>
          </Field>
          <Field data-invalid={!!form.formState.errors.role}>
            <FieldLabel>Role</FieldLabel>
            <FieldContent>
              <select
                {...form.register("role")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <FieldError errors={form.formState.errors.role ? [form.formState.errors.role] : undefined} />
            </FieldContent>
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Inviting..." : "Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
