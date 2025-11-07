"use client"

import { ActionButtonWithConfirm } from "@/components/new/action-button-with-confirm";
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS,
} from "@/lib/auth/o-auth-providers"

export function SocialAuthButtons() {
  return SUPPORTED_OAUTH_PROVIDERS.map(provider => {
    const Icon = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].Icon

    return (
      <ActionButtonWithConfirm
        variant="outline"
        key={provider}
        action={async () => {
          const result = await authClient.signIn.social({
            provider,
            callbackURL: "/",
          });

          if (result?.error) {
            return { success: false, error: result.error.message || "Failed to sign in" };
          }

          if (result?.data?.url) {
            window.location.href = result.data.url;
            return { success: true, message: "Redirecting to sign in..." };
          }

          return { success: true, message: "Signed in successfully" };
        }}
        dialogTitle={`Sign in with ${SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}`}
        dialogDescription={`You will be redirected to ${SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name} to complete sign in.`}
        confirmText="Continue"
        successMessage="Redirecting to sign in..."
        errorMessage="Failed to sign in"
      >
        <Icon />
        {SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}
      </ActionButtonWithConfirm>
    )
  })
}
