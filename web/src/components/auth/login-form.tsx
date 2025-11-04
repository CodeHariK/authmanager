"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/new/password-input";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Cloud } from "lucide-react";

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

interface LoginFormProps {
    setActiveTab: (tab: string) => void;
    onEmailNotVerified?: (email: string) => void;
}

export function LoginForm({ setActiveTab, onEmailNotVerified }: LoginFormProps) {
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        try {
            const res: any = await authClient.signIn.email({ ...values, callbackURL: "/" });
            
            // Check for error response
            if (res?.error) {
                const errorMessage = res.error?.message ?? "Sign in failed";
                toast.error(errorMessage);
                return;
            }
            
            // Check session after successful login
            const sessionRes = await authClient.getSession();
            if (sessionRes?.data?.user) {
                toast.success("Signed in");
            } else {
                toast.error("Signed in failed");
            }
        } catch (err: any) {
            const errorMessage = err?.message ?? "Sign in failed";
            toast.error(errorMessage);
        }
    }

    return (
        <>
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
                <Field data-invalid={!!form.formState.errors.password}>
                    <FieldLabel>Password</FieldLabel>
                    <FieldContent>
                        <PasswordInput 
                            placeholder="Your password" 
                            {...form.register("password")} 
                        />
                        <FieldError errors={form.formState.errors.password ? [form.formState.errors.password] : undefined} />
                    </FieldContent>
                </Field>
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
                
                <div className="text-center text-sm">
                    <button
                        type="button"
                        onClick={() => setActiveTab("forgot-password")}
                        className="text-primary hover:underline"
                    >
                        Forgot Password?
                    </button>
                </div>
            </form>

            <Separator className="my-4" />

            <Button variant="outline" className="w-full" 
                onClick={() => {
                    authClient.signIn.social({ provider: "google", callbackURL: "/" })
                }}>
                <Cloud /> Sign In with Google
            </Button>
        </>
    );
}
