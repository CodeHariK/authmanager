"use client";
import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    const isDark = mounted && resolvedTheme === "dark";

    return (
        <button
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground hover:bg-muted transition"
        >
            {mounted ? (
                isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
                <span className="h-4 w-4" />
            )}
        </button>
    );
}
