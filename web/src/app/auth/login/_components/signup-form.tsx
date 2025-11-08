"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/new/password-input";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";

const signupSchema = z.object({
    name: z.string().min(3),
    email: z.email(),
    password: z.string().min(6),
    favoriteNumber: z.string().min(1, "Favorite number is required"),
});

interface SignupFormProps {
    setActiveTab: (tab: string) => void;
    onEmailNotVerified?: (email: string) => void;
}

export function SignupForm({ setActiveTab, onEmailNotVerified }: SignupFormProps) {
    const router = useRouter();
    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: "", email: "", password: "", favoriteNumber: "" },
    });

    async function onSubmit(values: z.infer<typeof signupSchema>) {
        try {
            const res: any = await authClient.signUp.email({
                ...values,
                favoriteNumber: parseInt(values.favoriteNumber, 10),
            });
            if (res?.error) {
                toast.error(res.error?.message ?? "Sign up failed");
                return;
            }
            
            // Check if user was automatically signed in after signup
            const sessionRes = await authClient.getSession();
            if (sessionRes?.data?.user) {
                toast.success("Account created and signed in!");
                // Redirect to home page
                router.push("/");
            } else {
                toast.success("Account created. Please sign in.");
                // If not signed in, stay on login page
            }
        } catch (err: any) {
            toast.error(err?.message ?? "Sign up failed");
        }
    }

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
        >
            <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel>Name</FieldLabel>
                <FieldContent>
                    <Input 
                        type="text" 
                        placeholder="Your name" 
                        {...form.register("name")} 
                    />
                    <FieldError errors={form.formState.errors.name ? [form.formState.errors.name] : undefined} />
                </FieldContent>
            </Field>
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
                        placeholder="Create a password" 
                        {...form.register("password")} 
                    />
                    <FieldError errors={form.formState.errors.password ? [form.formState.errors.password] : undefined} />
                </FieldContent>
            </Field>
            <Field data-invalid={!!form.formState.errors.favoriteNumber}>
                <FieldLabel>Favorite Number</FieldLabel>
                <FieldContent>
                    <Input type="number" placeholder="Your favorite number" {...form.register("favoriteNumber")} />
                    <FieldError errors={form.formState.errors.favoriteNumber ? [form.formState.errors.favoriteNumber] : undefined} />
                </FieldContent>
            </Field>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create account"}
            </Button>
            <div className="text-center text-sm">
                <button
                    type="button"
                    onClick={() => setActiveTab("verify-email")}
                    className="text-primary hover:underline"
                >
                    Didn't receive verification email?
                </button>
            </div>
        </form>
    );
}

