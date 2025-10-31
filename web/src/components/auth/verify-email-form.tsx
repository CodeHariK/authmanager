"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const verifyEmailSchema = z.object({
    email: z.email(),
});

interface VerifyEmailFormProps {
    setActiveTab: (tab: string) => void;
    initialEmail?: string;
}

export function VerifyEmailForm({ setActiveTab, initialEmail }: VerifyEmailFormProps) {
    const { data: session } = authClient.useSession();
    const [cooldown, setCooldown] = useState(0);
    const [emailSent, setEmailSent] = useState(false);
    const form = useForm<z.infer<typeof verifyEmailSchema>>({
        resolver: zodResolver(verifyEmailSchema),
        defaultValues: { email: initialEmail ?? "" },
    });

    useEffect(() => {
        if (initialEmail) {
            form.setValue("email", initialEmail);
        }
    }, [initialEmail, form]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => {
                setCooldown(cooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    async function sendVerificationEmail(email: string) {
        try {
            const res: any = await authClient.sendVerificationEmail({ 
                email,
                callbackURL: "/?verified=true"
            });
            if (res?.error) {
                toast.error(res.error?.message ?? "Failed to send verification email");
                return;
            }
            toast.success("Verification email sent! Check your inbox.");
            setEmailSent(true);
            // Start 60 second cooldown
            setCooldown(60);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to send verification email");
        }
    }

    async function onSubmit(values: z.infer<typeof verifyEmailSchema>) {
        await sendVerificationEmail(values.email);
    }

    return (
        <Form {...form}>
            {emailSent && (
                <div className="mb-4 p-3 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-200">
                    <p className="font-medium">Verification email sent!</p>
                    <p className="text-xs mt-1">Please check your inbox and click the verification link. If you don't see it, check your spam folder.</p>
                </div>
            )}
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
                                <Input 
                                    type="email" 
                                    placeholder="you@example.com" 
                                    {...field} 
                                    disabled={!!initialEmail}
                                    readOnly={!!initialEmail}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={form.formState.isSubmitting || cooldown > 0}
                >
                    {form.formState.isSubmitting 
                        ? "Sending..." 
                        : cooldown > 0 
                            ? `Resend in ${cooldown}s`
                            : "Send Verification Email"
                    }
                </Button>
                {!session && (
                    <div className="text-center text-sm">
                        <button
                            type="button"
                            onClick={() => setActiveTab("login")}
                            className="text-primary hover:underline"
                        >
                            Back to Sign In
                        </button>
                    </div>
                )}
            </form>
        </Form>
    );
}

