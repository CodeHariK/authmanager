import { createAuthClient } from "better-auth/react"
import type { auth } from "./auth.ts";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { BASE_URL } from "@/constants";

export const authClient = createAuthClient({
	baseURL: BASE_URL,
	plugins: [inferAdditionalFields<typeof auth>()],
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
