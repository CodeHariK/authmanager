"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/new/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const signupSchema = z.object({
    name: z.string().min(3),
    email: z.email(),
    password: z.string().min(6),
});

interface SignupFormProps {
    setActiveTab: (tab: string) => void;
    onEmailNotVerified?: (email: string) => void;
}

export function SignupForm({ setActiveTab, onEmailNotVerified }: SignupFormProps) {
    const router = useRouter();
    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    async function onSubmit(values: z.infer<typeof signupSchema>) {
        try {
            const res: any = await authClient.signUp.email(values);
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
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 mt-4"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <PasswordInput placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
        </Form>
    );
}

