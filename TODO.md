# AuthManager TODO

- [ ] Scaffold Next.js App Router project with TypeScript and Tailwind
- [ ] Install and initialize shadcn/ui with base components
- [ ] Add Drizzle ORM with SQLite (dev) and drizzle-kit migrations
- [ ] Define Drizzle schema: users, sessions, accounts, audit_logs, roles
- [ ] Integrate Better Auth with Drizzle adapter and session cookies
- [ ] Create auth routes and pages: signin, signup, reset password
- [ ] Implement middleware guards and role-based authorization
- [ ] Build dashboard and profile pages with session management
- [ ] Create admin users page with search, sort and session revoke
- [ ] Add OAuth provider (GitHub or Google) to Better Auth
- [ ] Implement audit logging for auth events
- [ ] Set up environment variables and local env templates
- [ ] Write seed script for initial admin user
- [ ] Optional: implement password reset email flow
- [ ] Optional: add TOTP 2FA with backup codes

---

Notes:
- Dev DB: SQLite. Prod DB: Postgres (Neon/Supabase).
- Keep code typed, readable, and self-documenting; comment only complex logic.
- Prefer explicit configuration and predictable behavior.
