"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel, FieldError } from "@/components/ui/field";
import { ProfileCard } from "./profile-card";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  image: z.string().refine(
    (val) => !val || z.string().url().safeParse(val).success,
    { message: "Invalid URL" }
  ).optional(),
  favoriteNumber: z.number().int(),
});

interface ProfileUpdateTabProps {
  session: any;
}

export function ProfileUpdateTab({ session }: ProfileUpdateTabProps) {
  const form = useForm<z.infer<typeof profileUpdateSchema>>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: session?.user?.name || "",
      image: session?.user?.image || "",
      favoriteNumber: session?.user?.favoriteNumber || 0,
    },
  });

  const [isUpdating, setIsUpdating] = useState(false);

  async function onSubmit(values: z.infer<typeof profileUpdateSchema>) {
    try {
      setIsUpdating(true);
      const updateData: any = {};
      if (values.name && values.name !== session?.user?.name) {
        updateData.name = values.name;
      }
      if (values.image !== undefined && values.image !== session?.user?.image) {
        updateData.image = values.image || null;
      }

      if (values.favoriteNumber && values.favoriteNumber !== session?.user?.favoriteNumber) { 
        updateData.favoriteNumber = values.favoriteNumber;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        return;
      }

      const result = await (authClient as any).updateUser?.(updateData);
      
      if (result?.error) {
        toast.error(result.error.message || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
      await authClient.getSession({ query: { disableCookieCache: true } });
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <ProfileCard user={session?.user || {}} />

      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
          <CardDescription>Update your name and profile image</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <Field data-invalid={!!form.formState.errors.image}>
              <FieldLabel>Profile Image URL</FieldLabel>
              <FieldContent>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  {...form.register("image")}
                />
                <FieldError errors={form.formState.errors.image ? [form.formState.errors.image] : undefined} />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a URL to your profile image. Leave empty to remove the image.
                </p>
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.favoriteNumber}>
              <FieldLabel>Favorite Number</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  placeholder="Your favorite number"
                  {...form.register("favoriteNumber")}
                />
              </FieldContent>
            </Field>

            <Button type="submit" disabled={isUpdating || form.formState.isSubmitting}>
              {isUpdating || form.formState.isSubmitting ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

