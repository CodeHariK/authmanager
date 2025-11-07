import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware } from "@better-auth/core/middleware";
import { and, desc, eq } from "drizzle-orm"
import { db } from "@/db";
import { member } from "@/db/schema";

import { sendPasswordResetEmail } from "../emails/password-reset-email"
import { sendEmailVerificationEmail } from "../emails/email-verification"
import { sendWelcomeEmail } from "../emails/welcome-email"
import { sendDeleteAccountVerificationEmail } from "../emails/delete-account-verification"
import { twoFactor } from "better-auth/plugins/two-factor"
import { passkey } from "better-auth/plugins/passkey"
import { admin as adminPlugin } from "better-auth/plugins/admin"
import { organization } from "better-auth/plugins/organization"
import { ac, admin, user } from "./permissions"
import { sendOrganizationInviteEmail } from "../emails/organization-invite-email"
import { stripe } from "@better-auth/stripe"
import Stripe from "stripe"
import { STRIPE_PLANS } from "./stripe"

import { secondaryStorage } from "@/lib/redis";
import { env } from "@/env";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-10-29.clover",
})


export const auth = betterAuth({
    appName: "Better Auth Demo",
    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: async ({ user, url, newEmail }) => {
            if (!user.name || !newEmail) return;
            await sendEmailVerificationEmail({
                user: { name: user.name, email: newEmail },
                url,
            })
            },
        },
        deleteUser: {
            enabled: true,
            sendDeleteAccountVerification: async ({ user, url }) => {
            if (!user.email || !user.name) return;
            await sendDeleteAccountVerificationEmail({ 
                user: { name: user.name, email: user.email }, 
                url 
            })
            },
        },
        additionalFields: {
            favoriteNumber: {
                type: "number",
                required: true,
            },
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
                input: false, // don't allow user to set role
            },
            lang: {
                type: "string",
                required: false,
                defaultValue: "en",
            },
        },
    },

    session: {
        modelName: "sessions",
        fields: {
            userId: "user_id",
        },
		additionalFields: {
			customField: {
				type: "string",
			}
		},
        storeSessionInDatabase: false,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        },
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24
    },

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Allow sign-in without verification
        sendResetPassword: async ({ user, url, token }) => {
            if (!user.email || !user.name) return;
            await sendPasswordResetEmail({ 
                user: { name: user.name, email: user.email }, 
                url 
            })
            console.log(`Sending password reset email to ${user.email} with URL: ${url}`);
        },
        onPasswordReset: async ({ user }, request) => {
            console.log(`Password for user ${user.email} has been reset.`);
        },
    },
    emailVerification: {
        enabled: true,
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url, token }) => {
            if (!user.email || !user.name) return;
            await sendEmailVerificationEmail({ 
                user: { name: user.name, email: user.email }, 
                url 
            })
            console.log(`Sending email verification email to ${user.email} with URL: ${url}`);
        },
    },

    socialProviders: {
        google: {
            enabled: true,
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            mapProfileToUser: profile => {
                return {
                    favoriteNumber: 0,
                }
            },
        },
    },


    rateLimit: {
        storage: "secondary-storage",
        window: 10, // time window in seconds
        max: 100, // max requests in the window
    },
    secondaryStorage: secondaryStorage,
    database: drizzleAdapter(db, {
        provider: "pg",
    }),


    plugins: [
        nextCookies(),
        twoFactor(),
        passkey(),
        adminPlugin({
            ac,
            roles: {
            admin,
            user,
            },
        }),
        organization({
            sendInvitationEmail: async ({
            email,
            organization,
            inviter,
            invitation,
            }: any) => {
            await sendOrganizationInviteEmail({
                invitation,
                inviter: inviter.user,
                organization,
                email,
            })
            },
        }),

        stripe({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
            createCustomerOnSignUp: true,
            subscription: {
            authorizeReference: async ({ user, referenceId, action }) => {
                const memberItem = await db.query.member.findFirst({
                where: and(
                    eq(member.organizationId, referenceId),
                    eq(member.userId, user.id)
                ),
                })

                if (
                action === "upgrade-subscription" ||
                action === "cancel-subscription" ||
                action === "restore-subscription"
                ) {
                return memberItem?.role === "owner"
                }

                return memberItem != null
            },
            enabled: true,
            plans: STRIPE_PLANS,
            },
        }),
    ],


    hooks: {
        after: createAuthMiddleware(async ctx => {
            if (ctx.path.startsWith("/sign-up")) {
                const user = ctx.context.newSession?.user ?? {
                name: (ctx.body as any)?.name,
                email: (ctx.body as any)?.email,
                }
        
                if (user != null && user.email && user.name) {
                await sendWelcomeEmail({ name: user.name, email: user.email })
                }
            }
        }),
    },
    databaseHooks: {
        session: {
            create: {
                before: async userSession => {
                const membership = await db.query.member.findFirst({
                    where: eq(member.userId, userSession.userId),
                    orderBy: desc(member.createdAt),
                    columns: { organizationId: true },
                })
        
                return {
                    data: {
                    ...userSession,
                    activeOrganizationId: membership?.organizationId,
                    },
                }
                },
            },
        },
    },
})
