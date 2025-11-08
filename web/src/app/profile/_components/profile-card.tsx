"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type User = {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    emailVerified?: boolean;
};

type ProfileCardProps = {
    user: User;
};

export function ProfileCard({ user }: ProfileCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        {user.image ? (
                            <img 
                                src={user.image} 
                                alt="Profile" 
                                className="w-24 h-24 rounded-full border-4 border-background shadow-lg object-cover" 
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-background shadow-lg bg-muted flex items-center justify-center">
                                <span className="text-3xl font-semibold text-muted-foreground">
                                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-bold">
                            {user.name || "No Name"}
                        </h2>
                        {user.email && (
                            <p className="text-muted-foreground">{user.email}</p>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Email Status</span>
                            <span className={`text-sm font-semibold ${user.emailVerified ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>
                                {user.emailVerified ? (
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></span>
                                        Verified
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-orange-600 dark:bg-orange-400"></span>
                                        Not Verified
                                    </span>
                                )}
                            </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">User ID</span>
                            <span className="text-sm font-mono text-muted-foreground truncate max-w-[200px]">
                                {user.id || "No ID"}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
