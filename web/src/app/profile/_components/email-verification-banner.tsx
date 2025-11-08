"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Mail } from "lucide-react";
import Link from "next/link";

export function EmailVerificationBanner() {
    return (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
            <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                            Email Verification Required
                        </h3>
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                            Please verify your email address to access all features and ensure account security.
                        </p>
                        <Link href="/auth/login?tab=verify-email">
                            <Button variant="outline" size="sm" className="mt-2">
                                <Mail className="h-4 w-4 mr-2" />
                                Verify Email Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

