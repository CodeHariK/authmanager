import { z } from "zod";

const schema = z.object({
    NEXT_PUBLIC_BASE_URL: z.url(),
    GOOSE_DBSTRING: z.string().min(1).refine((s) => s.startsWith("postgres"), "Must be a Postgres URL"),
    BETTER_AUTH_SECRET: z.string().min(16),
    NEXT_PUBLIC_APP_NAME: z.string().default("AuthManager"),
    REDIS_USERNAME: z.string().optional(),
    REDIS_PASSWORD: z.string(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),
    // OAuth Providers
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // Email Providers
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().optional(),
});

// Only parse on server side and only once at startup
let env: z.infer<typeof schema>;
let envParsed = false;

if (typeof window === "undefined") {
    // Server-side only
    try {
        env = schema.parse(process.env);
        envParsed = true;
    } catch (error) {
        console.error("❌ Environment validation failed:");
        console.error(error);
        process.exit(1);
    }
} else {
    // Client-side: only export public vars
    env = {
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
        GOOSE_DBSTRING: "",
        BETTER_AUTH_SECRET: "",
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "AuthManager",
        REDIS_USERNAME: undefined,
        REDIS_PASSWORD: "",
        REDIS_HOST: "",
        REDIS_PORT: 0,
        GOOGLE_CLIENT_ID: undefined,
        GOOGLE_CLIENT_SECRET: undefined,
        RESEND_API_KEY: undefined,
        RESEND_FROM_EMAIL: undefined,
    } as z.infer<typeof schema>;
}

export { env };
