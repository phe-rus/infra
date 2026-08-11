# Pherus

Self-hosted authentication infrastructure. Pherus runs on your own Cloudflare
account and gives you the pieces a Firebase Auth / Supabase Auth / Clerk would
otherwise host for you — but you own the data, the database, and the uptime.

## What we're building

Two things, under one roof:

1. **The auth backend** — a [better-auth](https://better-auth.com) instance
   (email/password, magic link, OTP, passkeys, 2FA, API keys, admin plugin)
   running on Cloudflare Workers, backed by D1 (Postgres-compatible SQLite)
   and KV. This is what your *other* applications point at to authenticate
   their users — the same job Firebase Auth or Supabase Auth does, just
   self-hosted.
2. **"Infra"** — the admin dashboard in this repo, for the person who runs
   the instance. It's where you configure sign-in providers, define roles
   and who's allowed to sign into the *admin console itself*, manage the
   people who have accounts on the instance (ban, impersonate, reset
   passwords, inspect sessions and connected credentials), and issue API
   keys for server-to-server access.

## The aim

Give a small team (or a solo dev) a real, production-shaped auth backend
without a vendor bill or a vendor's data-residency terms — while making the
*admin experience* of running that backend as good as the hosted
alternatives', not an afterthought CLI or a raw database console.

## The approach

- **One Cloudflare Worker, one codebase.** TanStack Start (React 19, SSR)
  serves both the dashboard UI and better-auth's HTTP API from the same
  Worker — no separate backend service to deploy or version alongside it.
- **better-auth is the source of truth for identity.** We don't reimplement
  session handling, password hashing policy, or the admin/ban/impersonation
  primitives — we configure better-auth's plugins and build UI on top of its
  server API (`auth.api.*`), rather than talking to the database directly
  except where better-auth has no endpoint for it (e.g. reading a user's
  linked OAuth accounts for display).
- **Role-gated by default, not by accident.** Nobody gets into the admin
  console just by having *an* account on the instance — see
  `CLAUDE.md` → Access model for how owner/admin/custom-role access is
  decided.
- **Own the primitives, don't over-abstract early.** Shared UI building
  blocks (a data table with search/filter/sort/pagination, a form-field
  system, a drawer/dialog wrapper) live under `components/widgets/` and are
  meant to be genuinely reusable — not a pile of one-off page components
  wearing a shared folder name.

## Status

The auth backend (sign-up/sign-in, sessions, the plugin set) works today.
The admin console has: first-run setup, provider/security settings, team
role definitions + who's allowed to sign in, full user management (roles,
bans, sessions, impersonation, password resets), and self-service API keys.
Not yet built: database/storage/environment-variables/logs/billing pages —
those are placeholders in the nav today.

See `CLAUDE.md` for the technical architecture, and its **Known issues /
cleanup backlog** section for what's intentionally left rough right now.

## Commands

```bash
bun install       # install dependencies
bun run dev       # start dev server on port 3000
bun run build     # production build (vite build)
bun run preview   # preview a production build
bun run test      # run the vitest suite once (vitest run)
bun run lint      # eslint
bun run format    # prettier --write across ts/tsx/js/jsx
bun run check     # prettier --check (no writes)
bun run typecheck # tsc --noEmit
```
