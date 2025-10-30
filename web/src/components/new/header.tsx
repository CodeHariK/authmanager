"use client";

import { ThemeToggle } from "./themetoggle";

export default function Header() {
    return (
        <header className="w-full border-b">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                <div className="font-semibold">AuthManager</div>
                <div>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
