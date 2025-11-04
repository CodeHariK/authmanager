"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { User as UserIcon, LogOut } from "lucide-react";
import { ConfirmationDialog } from "@/components/new/confirmation-dialog";
import { toast } from "sonner";

export function UserMenu() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const [isHovering, setIsHovering] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

    if (!session?.user) {
        return null;
    }

    const handleSignOut = async () => {
        try {
            await authClient.signOut();
            setIsOpen(false);
            setSignOutDialogOpen(false);
            toast.success("Signed out successfully");
            router.refresh();
        } catch (err: any) {
            console.error("Failed to sign out:", err);
            toast.error(err?.message ?? "Failed to sign out");
        }
    };

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
                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                            setIsOpen(false);
                            setSignOutDialogOpen(true);
                        }}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            )}

            <ConfirmationDialog
                open={signOutDialogOpen}
                onOpenChange={setSignOutDialogOpen}
                title="Sign Out"
                description="Are you sure you want to sign out? You will need to sign in again to access your account."
                confirmText="Sign Out"
                onConfirm={handleSignOut}
            />
        </div>
    );
}
