# AuthManager

A minimal plan to build an authentication manager using Next.js (App Router), Drizzle ORM, shadcn/ui, and Better Auth.

## Prerequisites

- Bun 1.1+

## Quickstart (commands)

### 1) Scaffold Next.js app

```bash
# from /Users/Shared/Code/authmanager
bunx create-next-app@latest web \
  --ts \
  --tailwind \
  --eslint \
  --app \
  --src-dir false \
  --import-alias "@/*"
```

### 2) Install dependencies

```bash
# UI
bun add shadcn-ui class-variance-authority clsx tailwind-merge

# Auth + ORM
bun add better-auth drizzle-orm zod
bun add -d drizzle-kit

# Database: Postgres (Supabase)
bun add pg
```

### 3) Initialize shadcn/ui

```bash
# If the CLI complains about git, initialize a repo first:
#   git init -b main && git add -A && git commit -m "init"

bunx shadcn@latest init -y
bunx shadcn@latest add button input form dialog table sonner
```

### 4) Environment variables

Create `web/.env.local` with your Supabase connection string (include `?sslmode=require` if needed):

```bash
# Example
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
BETTER_AUTH_SECRET="replace-with-strong-secret"
NEXT_PUBLIC_APP_NAME="AuthManager"
```

### 5) Drizzle setup (Postgres/Supabase)

```bash
# drizzle.config.ts is set to dialect "postgresql"
# Create schema in src/db/schema.ts and then generate/apply migrations
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

`drizzle.config.ts` (already created):

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

### 6) Environment validation (Zod)

Add `src/env.ts` to validate required env vars at startup and import where needed:

```ts
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(16),
  NEXT_PUBLIC_APP_NAME: z.string().default("AuthManager"),
});

export const env = schema.parse(process.env);
```

### 7) Dev scripts

```bash
# Start dev server
bun run dev

# Drizzle
bun run db:generate  # alias for: bunx drizzle-kit generate
bun run db:migrate   # alias for: bunx drizzle-kit migrate
```

Ensure `package.json` has:

```json
{
  "scripts": {
    "dev": "next dev",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

## Next steps

- Define Drizzle schema: users, sessions, accounts, audit_logs, roles
- Wire Better Auth with Drizzle adapter and secure cookies
- Build pages: /signin, /signup, /dashboard, /admin/users
- Add middleware guards and role checks
- Add OAuth provider and audit logging

Refer to `TODO.md` for the full task list.
