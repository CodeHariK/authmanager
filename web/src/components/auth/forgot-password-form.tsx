"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 mt-4"
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
        </Form>
    );
}

