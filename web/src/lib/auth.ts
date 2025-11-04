import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware } from "@better-auth/core/middleware";

import { db } from "@/db";
import { secondaryStorage } from "./redis";
import { env } from "@/env";


export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Allow sign-in without verification
        sendResetPassword: async ({ user, url, token }) => {
            // TODO: Implement email sending service (e.g., Resend, SendGrid, etc.)
            console.log(`Sending password reset email to ${user.email} with URL: ${url}`);
            // Example: await sendEmail({ to: user.email, subject: "Reset Password", body: `Click here to reset: ${url}` });
        },
        onPasswordReset: async ({ user }, request) => {
            console.log(`Password for user ${user.email} has been reset.`);
        },
    },
    emailVerification: {
        enabled: true,
        sendVerificationEmail: async ({ user, url, token }) => {
            // TODO: Implement email sending service (e.g., Resend, SendGrid, etc.)
            console.log(`Sending email verification email to ${user.email} with URL: ${url}`);
            // Example: await sendEmail({ to: user.email, subject: "Verify Email", body: `Click here to verify: ${url}` });
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        },
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24
    },
    socialProviders: {
        google: {
            enabled: true,
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
    secondaryStorage: secondaryStorage,
    rateLimit: {
        storage: "secondary-storage",
        window: 10, // time window in seconds
        max: 100, // max requests in the window
    },
    plugins: [nextCookies()],
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    hooks: {
        after: createAuthMiddleware(async ctx => {
            const user = ctx.context.newSession?.user;
            console.log("\n\n>>> ", ctx.path, ctx.method, user, ctx.body, ctx.context.session?.user)
            
            if (ctx.path.includes("sign-up")) {
                if (user != null) {
                    //Todo: Send welcome email to user
                    console.log(">>>> Send welcome email to user");
                }
            }
        }),
    },
});
