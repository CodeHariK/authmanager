"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { User as UserIcon, LogOut } from "lucide-react";
import { ActionButtonWithConfirm } from "@/components/new/action-button-with-confirm";

export function UserMenu() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const [isHovering, setIsHovering] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    if (!session?.user) {
        return null;
    }

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground hover:bg-muted transition"
                aria-label="User menu"
            >
                {session.user.image ? (
                    <img
                        src={session.user.image}
                        alt="Profile"
                        className="h-6 w-6 rounded-full object-cover"
                    />
                ) : (
                    <UserIcon className="h-4 w-4" />
                )}
            </button>

            {(isHovering || isOpen) && (
                <div
                    className="absolute right-0 top-11 z-50 w-64 rounded-lg border bg-background shadow-lg p-4 space-y-3"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Signed in as</p>
                        <p className="text-sm text-muted-foreground truncate">
                            {session.user.email || "No email"}
                        </p>
                    </div>

                    <ActionButtonWithConfirm
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        action={async () => {
                            await authClient.signOut();
                            setIsOpen(false);
                            return { success: true, message: "Signed out successfully" };
                        }}
                        dialogTitle="Sign Out"
                        dialogDescription="Are you sure you want to sign out? You will need to sign in again to access your account."
                        confirmText="Sign Out"
                        successMessage="Signed out successfully"
                        errorMessage="Failed to sign out"
                        onSuccess={() => router.refresh()}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </ActionButtonWithConfirm>

                </div>
            )}
        </div>
    );
}
