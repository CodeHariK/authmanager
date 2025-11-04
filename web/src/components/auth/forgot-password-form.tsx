"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
    email: z.email(),
});

interface ForgotPasswordFormProps {
    setActiveTab: (tab: string) => void;
}

export function ForgotPasswordForm({ setActiveTab }: ForgotPasswordFormProps) {
    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
        try {
            const res: any = await authClient.forgetPassword({ email: values.email });
            if (res?.error) {
                toast.error(res.error?.message ?? "Failed to send reset email");
                return;
            }
            toast.success("Password reset email sent! Check your inbox.");
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to send reset email");
        }
    }

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
        >
            <Field data-invalid={!!form.formState.errors.email}>
                <FieldLabel>Email</FieldLabel>
                <FieldContent>
                    <Input 
                        type="email" 
                        placeholder="you@example.com" 
                        {...form.register("email")} 
                    />
                    <FieldError errors={form.formState.errors.email ? [form.formState.errors.email] : undefined} />
                </FieldContent>
            </Field>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
            <div className="text-center text-sm">
                <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-primary hover:underline"
                >
                    Back to Sign In
                </button>
            </div>
        </form>
    );
}

