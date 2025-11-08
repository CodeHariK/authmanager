"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { PasswordInput } from "@/components/new/password-input"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import QRCode from "react-qr-code"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"

const twoFactorAuthSchema = z.object({
  password: z.string().min(1),
})

type TwoFactorAuthForm = z.infer<typeof twoFactorAuthSchema>
type TwoFactorData = {
  totpURI: string
  backupCodes: string[]
}

export function TwoFactorAuth({ isEnabled }: { isEnabled: boolean }) {
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(null)
  const router = useRouter()
  const form = useForm<TwoFactorAuthForm>({
    resolver: zodResolver(twoFactorAuthSchema),
    defaultValues: { password: "" },
  })

  const { isSubmitting } = form.formState

  async function handleDisableTwoFactorAuth(data: TwoFactorAuthForm) {
    await authClient.twoFactor.disable(
      {
        password: data.password,
      },
      {
        onError: error => {
          toast.error(error.error.message || "Failed to disable 2FA")
        },
        onSuccess: () => {
          form.reset()
          router.refresh()
        },
      }
    )
  }

  async function handleEnableTwoFactorAuth(data: TwoFactorAuthForm) {
    const result = await authClient.twoFactor.enable({
      password: data.password,
    })

    if (result.error) {
      toast.error(result.error.message || "Failed to enable 2FA")
    }
    {
      setTwoFactorData(result.data)
      form.reset()
    }
  }

  if (twoFactorData != null) {
    return (
      <QRCodeVerify
        {...twoFactorData}
        onDone={() => {
          setTwoFactorData(null)
        }}
      />
    )
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(
        isEnabled ? handleDisableTwoFactorAuth : handleEnableTwoFactorAuth
      )}
    >
      <Field data-invalid={!!form.formState.errors.password}>
        <FieldLabel>Password</FieldLabel>
        <FieldContent>
          <PasswordInput {...form.register("password")} />
          <FieldError errors={form.formState.errors.password ? [form.formState.errors.password] : undefined} />
        </FieldContent>
      </Field>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        variant={isEnabled ? "destructive" : "default"}
      >
        {isSubmitting ? "Processing..." : isEnabled ? "Disable 2FA" : "Enable 2FA"}
      </Button>
    </form>
  )
}

const qrSchema = z.object({
  token: z.string().length(6),
})

type QrForm = z.infer<typeof qrSchema>

function QRCodeVerify({
  totpURI,
  backupCodes,
  onDone,
}: TwoFactorData & { onDone: () => void }) {
  const [successfullyEnabled, setSuccessfullyEnabled] = useState(false)
  const router = useRouter()
  const form = useForm<QrForm>({
    resolver: zodResolver(qrSchema),
    defaultValues: { token: "" },
  })

  const { isSubmitting } = form.formState

  async function handleQrCode(data: QrForm) {
    await authClient.twoFactor.verifyTotp(
      {
        code: data.token,
      },
      {
        onError: error => {
          toast.error(error.error.message || "Failed to verify code")
        },
        onSuccess: () => {
          setSuccessfullyEnabled(true)
          router.refresh()
        },
      }
    )
  }

  if (successfullyEnabled) {
    return (
      <>
        <p className="text-sm text-muted-foreground mb-2">
          Save these backup codes in a safe place. You can use them to access
          your account.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {backupCodes.map((code, index) => (
            <div key={index} className="font-mono text-sm">
              {code}
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={onDone}>
          Done
        </Button>
      </>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Scan this QR code with your authenticator app and enter the code below:
      </p>

      <form className="space-y-4" onSubmit={form.handleSubmit(handleQrCode)}>
        <Field data-invalid={!!form.formState.errors.token}>
          <FieldLabel>Code</FieldLabel>
          <FieldContent>
            <Input {...form.register("token")} />
            <FieldError errors={form.formState.errors.token ? [form.formState.errors.token] : undefined} />
          </FieldContent>
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Processing..." : "Submit Code"}
        </Button>
      </form>
      <div className="p-4 bg-white w-fit">
        <QRCode size={256} value={totpURI} />
      </div>
    </div>
  )
}
