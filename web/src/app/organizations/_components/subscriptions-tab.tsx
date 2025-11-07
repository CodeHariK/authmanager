"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"
import { useEffect, useState } from "react"
import { Subscription } from "@better-auth/stripe"
import { toast } from "sonner"
import { PLAN_TO_PRICE, STRIPE_PLANS } from "@/lib/auth/stripe"
import { ActionButtonWithConfirm } from "@/components/new/action-button-with-confirm";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function SubscriptionsTab() {
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  useEffect(() => {
    if (activeOrganization == null) {
      return setSubscriptions([])
    }

    authClient.subscription
      .list({ query: { referenceId: activeOrganization.id } })
      .then(result => {
        if (result.error) {
          setSubscriptions([])
          toast.error("Failed to load subscriptions")
          return
        }

        setSubscriptions(result.data)
      })
  }, [activeOrganization])

  const activeSubscription = subscriptions.find(
    sub => sub.status === "active" || sub.status === "trialing"
  )
  const activePlan = STRIPE_PLANS.find(
    plan => plan.name === activeSubscription?.plan
  )

  async function handleBillingPortal() {
    if (activeOrganization == null) {
      return { success: false, error: "No active organization" };
    }

    const res = await authClient.subscription.billingPortal({
      referenceId: activeOrganization.id,
      returnUrl: window.location.href,
    });

    if (res.error) {
      return { success: false, error: res.error.message || "Failed to open billing portal" };
    }

    if (res.data?.url) {
      window.location.href = res.data.url;
      return { success: true, message: "Redirecting to billing portal..." };
    }

    return { success: true, message: "Billing portal opened" };
  }

  async function handleCancelSubscription() {
    if (activeOrganization == null) {
      return { success: false, error: "No active organization" };
    }

    if (activeSubscription == null) {
      return { success: false, error: "No active subscription" };
    }

    const result = await authClient.subscription.cancel({
      subscriptionId: activeSubscription.id,
      referenceId: activeOrganization.id,
      returnUrl: window.location.href,
    });

    if (result?.error) {
      return { success: false, error: result.error.message || "Failed to cancel subscription" };
    }

    if (result?.data?.url) {
      window.location.href = result.data.url;
      return { success: true, message: "Redirecting to cancel subscription..." };
    }

    return { success: true, message: "Subscription cancelled successfully" };
  }

  async function handleSubscriptionChange(plan: string) {
    if (activeOrganization == null) {
      return { success: false, error: "No active organization" };
    }

    const result = await authClient.subscription.upgrade({
      plan,
      subscriptionId: activeSubscription?.id,
      referenceId: activeOrganization.id,
      returnUrl: window.location.href,
      successUrl: window.location.href,
      cancelUrl: window.location.href,
    });

    if (result?.error) {
      return { success: false, error: result.error.message || "Failed to change subscription" };
    }

    if (result?.data?.url) {
      window.location.href = result.data.url;
      return { success: true, message: "Redirecting to complete subscription change..." };
    }

    return { success: true, message: "Subscription changed successfully" };
  }

  return (
    <div className="space-y-6">
      {activeSubscription && activePlan && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold capitalize">
                    {activeSubscription.plan} Plan
                  </h3>
                  {activeSubscription.priceId && (
                    <Badge variant="secondary">
                      {currencyFormatter.format(
                        PLAN_TO_PRICE[activeSubscription.plan]
                      )}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activePlan.limits.projects} projects included
                </p>
                {activeSubscription.periodEnd && (
                  <p className="text-sm text-muted-foreground">
                    {activeSubscription.cancelAtPeriodEnd
                      ? "Cancels on "
                      : "Renews on "}
                    {activeSubscription.periodEnd.toLocaleDateString()}
                  </p>
                )}
              </div>
              <ActionButtonWithConfirm
                variant="outline"
                action={handleBillingPortal}
                className="flex items-center gap-2"
                dialogTitle="Open Billing Portal"
                dialogDescription="You will be redirected to the billing portal to manage your subscription and payment methods."
                confirmText="Continue"
                successMessage="Redirecting to billing portal..."
                errorMessage="Failed to open billing portal"
              >
                Billing Portal
              </ActionButtonWithConfirm>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {STRIPE_PLANS.map(plan => (
          <Card key={plan.name} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl capitalize">
                  {plan.name}
                </CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {currencyFormatter.format(PLAN_TO_PRICE[plan.name])}
                  </div>
                </div>
              </div>
              <CardDescription>
                Up to {plan.limits.projects} projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeSubscription?.plan === plan.name ? (
                activeSubscription.cancelAtPeriodEnd ? (
                  <Button disabled variant="outline" className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <ActionButtonWithConfirm
                    variant="destructive"
                    className="w-full"
                    action={handleCancelSubscription}
                    dialogTitle="Cancel Subscription"
                    dialogDescription="Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period."
                    confirmText="Cancel Subscription"
                    successMessage="Subscription cancelled successfully"
                    errorMessage="Failed to cancel subscription"
                  >
                    Cancel Subscription
                  </ActionButtonWithConfirm>
                )
              ) : (
                <ActionButtonWithConfirm
                  action={() => handleSubscriptionChange(plan.name)}
                  className="w-full"
                  dialogTitle={activeSubscription == null ? "Subscribe" : "Change Plan"}
                  dialogDescription={`You will be redirected to complete the ${activeSubscription == null ? "subscription" : "plan change"} process.`}
                  confirmText="Continue"
                  successMessage="Redirecting to complete subscription..."
                  errorMessage="Failed to change subscription"
                >
                  {activeSubscription == null ? "Subscribe" : "Change Plan"}
                </ActionButtonWithConfirm>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
