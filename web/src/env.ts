import { z } from "zod";

const schema = z.object({
    NEXT_PUBLIC_BASE_URL: z.url(),
    GOOSE_DBSTRING: z.string().min(1).refine((s) => s.startsWith("postgres"), "Must be a Postgres URL"),
    BETTER_AUTH_SECRET: z.string().min(16),
    NEXT_PUBLIC_APP_NAME: z.string().default("AuthManager"),
});

export const env = schema.parse(process.env);

console.log(env);