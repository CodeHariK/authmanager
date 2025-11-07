import { createAuthClient } from "better-auth/react"
import type { auth } from "./auth.ts";
import {
    inferAdditionalFields,
    passkeyClient,
    twoFactorClient,
    adminClient,
    organizationClient,
} from "better-auth/client/plugins"

import { ac, admin, user } from "./permissions"
import { stripeClient } from "@better-auth/stripe/client"

import { BASE_URL } from "@/constants";

export const authClient = createAuthClient({
	baseURL: BASE_URL,
	plugins: [
        inferAdditionalFields<typeof auth>(),
        passkeyClient(),
    twoFactorClient({
        onTwoFactorRedirect: () => {
            window.location.href = "/auth/2fa"
        },
    }),
    adminClient({
        ac,
        roles: {
            admin,
            user,
        },
    }),
    organizationClient(),
    stripeClient({
        subscription: true,
    }),
    ],
	fetchOptions: {
        onError: async (context) => {
            const { response } = context;
            if (response.status === 429) {
                const retryAfter = response.headers.get("X-Retry-After");
                console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
            }
        },
    }
});
