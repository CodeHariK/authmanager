"use client";

import { ThemeToggle } from "./themetoggle";
import { UserMenu } from "../auth/user-menu";
import Link from "next/link";

export default function Header() {
    return (
        <header className="w-full border-b">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                <Link href="/">
                    <div className="font-semibold">AuthManager</div>
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
