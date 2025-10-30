import { z } from "zod";

const schema = z.object({
    API_URL: z.string().url(),
    DATABASE_URL: z.string().min(1).refine((s) => s.startsWith("postgres"), "Must be a Postgres URL"),
    BETTER_AUTH_SECRET: z.string().min(16),
    NEXT_PUBLIC_APP_NAME: z.string().default("AuthManager"),
});

export const env = schema.parse(process.env);

console.log(env);