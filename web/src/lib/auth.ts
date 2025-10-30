import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db";

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        }
    },
    oauth: {
        enabled: true,
        providers: [
            {
                id: "google",
            },
        ],
    },
    plugins: [nextCookies()],
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
});
