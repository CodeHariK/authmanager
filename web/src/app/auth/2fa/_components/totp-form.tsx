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

const totpSchema = z.object({
  code: z.string().length(6),
})

type TotpForm = z.infer<typeof totpSchema>

export function TotpForm() {
  const router = useRouter()
  const form = useForm<TotpForm>({
    resolver: zodResolver(totpSchema),
    defaultValues: {
      code: "",
    },
  })

  const { isSubmitting } = form.formState

  async function handleTotpVerification(data: TotpForm) {
    await authClient.twoFactor.verifyTotp(data, {
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
      onSubmit={form.handleSubmit(handleTotpVerification)}
    >
      <Field data-invalid={!!form.formState.errors.code}>
        <FieldLabel>Code</FieldLabel>
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
