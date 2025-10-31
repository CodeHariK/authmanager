"use client";

import * as React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff } from "lucide-react";

export interface PasswordInputProps
    extends Omit<React.ComponentPropsWithoutRef<typeof Input>, "type"> {
}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
    const [show, setShow] = React.useState(false);
    return (
        <div className="relative">
            <Input type={show ? "text" : "password"} className={className} {...props} />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow((v) => !v)}
            >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
        </div>
    );
}
