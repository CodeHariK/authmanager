"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"

const backupCodeSchema = z.object({
  code: z.string().min(1),
})

type BackupCodeForm = z.infer<typeof backupCodeSchema>

export function BackupCodeTab() {
  const router = useRouter()
  const form = useForm<BackupCodeForm>({
    resolver: zodResolver(backupCodeSchema),
    defaultValues: {
      code: "",
    },
  })

  const { isSubmitting } = form.formState

  async function handleBackupCodeVerification(data: BackupCodeForm) {
    await authClient.twoFactor.verifyBackupCode(data, {
      onError: error => {
        toast.error(error.error.message || "Failed to verify code")
      },
      onSuccess: () => {
        router.push("/")
      },
    })
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(handleBackupCodeVerification)}
    >
      <Field data-invalid={!!form.formState.errors.code}>
        <FieldLabel>Backup Code</FieldLabel>
        <FieldContent>
          <Input {...form.register("code")} />
          <FieldError errors={form.formState.errors.code ? [form.formState.errors.code] : undefined} />
        </FieldContent>
      </Field>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Verifying..." : "Verify"}
      </Button>
    </form>
  )
}
