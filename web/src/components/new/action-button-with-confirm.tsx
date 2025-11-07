"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/new/confirmation-dialog";
import { toast } from "sonner";
import type React from "react";

interface ActionResponse {
    success: boolean;
    message?: string;
    error?: string | Error;
}

type ActionFunction = () => Promise<ActionResponse | void>;

interface ActionButtonWithConfirmProps extends Omit<React.ComponentProps<typeof Button>, "onClick" | "onError"> {
    action: ActionFunction;
    dialogTitle: string;
    dialogDescription: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (response?: ActionResponse) => void;
    onError?: (error?: string | Error) => void;
}

export function ActionButtonWithConfirm({
    action,
    dialogTitle,
    dialogDescription,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "destructive",
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    children,
    ...buttonProps
}: ActionButtonWithConfirmProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const response = await action();
            
            // Handle response object
            if (response && typeof response === "object" && "success" in response) {
                if (response.success) {
                    const message = successMessage || response.message || "Action completed successfully";
                    toast.success(message);
                    onSuccess?.(response);
                } else {
                    const error = response.error || response.message || "Action failed";
                    const errorMsg = errorMessage || (typeof error === "string" ? error : error.message || "Action failed");
                    toast.error(errorMsg);
                    onError?.(error);
                }
            } else {
                // No response object - assume success
                const message = successMessage || "Action completed successfully";
                toast.success(message);
                onSuccess?.();
            }
            
            setIsDialogOpen(false);
        } catch (error) {
            const errorMsg = errorMessage || (error instanceof Error ? error.message : "An error occurred");
            toast.error(errorMsg);
            onError?.(error instanceof Error ? error : String(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setIsDialogOpen(true)} {...buttonProps}>
                {children}
            </Button>
            <ConfirmationDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title={dialogTitle}
                description={dialogDescription}
                confirmText={confirmText}
                cancelText={cancelText}
                confirmVariant={confirmVariant}
                onConfirm={handleConfirm}
                loading={isLoading}
                disabled={isLoading}
            />
        </>
    );
}

