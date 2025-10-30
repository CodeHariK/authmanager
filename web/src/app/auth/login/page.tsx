"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

const signupSchema = z.object({
    name: z.string().min(3),
    email: z.email(),
    password: z.string().min(6),
});

export default function AuthPage() {
    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const signupForm = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    async function onLogin(values: z.infer<typeof loginSchema>) {
        await authClient.signIn.email(values);
        window.location.href = "/";
    }

    async function onSignup(values: z.infer<typeof signupSchema>) {
        try {
            await authClient.signUp.email({ ...values, callbackURL: "/" });
            toast.success("Account created");
            window.location.href = "/";
        } catch (err: any) {
            toast.error(err?.message ?? "Sign up failed");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <Tabs defaultValue="login" className="w-full max-w-sm">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <Form {...loginForm}>
                        <form
                            onSubmit={loginForm.handleSubmit(onLogin)}
                            className="space-y-4 mt-4"
                        >
                            <FormField
                                control={loginForm.control}
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
                                control={loginForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <PasswordInput placeholder="Your password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                                {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>
                    </Form>
                </TabsContent>
                <TabsContent value="signup">
                    <Form {...signupForm}>
                        <form
                            onSubmit={signupForm.handleSubmit(onSignup)}
                            className="space-y-4 mt-4"
                        >
                            <FormField
                                control={signupForm.control}
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
                                control={signupForm.control}
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
                                control={signupForm.control}
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
                            <Button type="submit" className="w-full" disabled={signupForm.formState.isSubmitting}>
                                {signupForm.formState.isSubmitting ? "Creating..." : "Create account"}
                            </Button>
                        </form>
                    </Form>
                </TabsContent>
            </Tabs>
        </div>
    );
}
