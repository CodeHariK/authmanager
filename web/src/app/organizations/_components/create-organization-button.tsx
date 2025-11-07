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

const createOrganizationSchema = z.object({
  name: z.string().min(1),
})

type CreateOrganizationForm = z.infer<typeof createOrganizationSchema>

export function CreateOrganizationButton() {
  const [open, setOpen] = useState(false)
  const form = useForm<CreateOrganizationForm>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
    },
  })

  const { isSubmitting } = form.formState

  async function handleCreateOrganization(data: CreateOrganizationForm) {
    const slug = data.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
    const res = await authClient.organization.create({
      name: data.name,
      slug,
    })

    if (res.error) {
      toast.error(res.error.message || "Failed to create organization")
    } else {
      form.reset()
      setOpen(false)
      await authClient.organization.setActive({ organizationId: res.data.id })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Organization</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(handleCreateOrganization)}
        >
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel>Name</FieldLabel>
            <FieldContent>
              <Input {...form.register("name")} />
              <FieldError errors={form.formState.errors.name ? [form.formState.errors.name] : undefined} />
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
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
