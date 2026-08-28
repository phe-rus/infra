# Getting Started

Infra deploys to your own Cloudflare account. There's no separate server to provision: Workers, D1, KV, and R2 are all created as part of your account when you deploy.

Infra ships as two apps in one repo: **`infra`**, the auth engine and admin dashboard, and **`www`** ("Infraccount"), the end-user account app that hosts the sign-in/create-account/consent pages your users actually see. You need both running to sign in anywhere. `infra` redirects to `www` for those pages rather than rendering them itself.

## Prerequisites

- A Cloudflare account (Workers, D1, KV, and R2 are all available on the free tier to start)
- [Bun](https://bun.sh) as the package manager
- A [Resend](https://resend.com) API key, for transactional email (verification, password reset, account deletion)

## Install and run locally

From the repo root:

```bash
bun install                              # installs every workspace package
cp infra/.env.example infra/.env.local   # infra's secrets, see comments in the file
cp www/.env.example www/.env.local       # www's config (points at infra's URL)
bun run dev                              # starts infra on :3000 and www on :3001
```

`.env.local` holds every secret each app needs locally (database/KV/R2 bindings are provisioned automatically by Wrangler in dev). It is never committed. `.env.example` documents every key you need to fill in. Whenever you change an `.env.local` file, re-run `bun run type-gen` and fully restart the dev server rather than relying on Vite's own file-watcher restart.

## First run

The first time you visit a fresh instance, you're walked through a short setup flow (`infra`'s `/setup`) to create the **owner** account, the one account with full control over the instance. Every account created after that (through `www`'s create-account page, or through an OAuth-connected application's sign-up flow) gets the plain `user` role by default and cannot access the admin dashboard.

## Deploy

`infra` and `www` are each their own Cloudflare Worker, deployed independently:

```bash
bun run build                # production build, every package
bun run --cwd infra deploy   # build and deploy infra (wrangler deploy)
bun run --cwd www deploy     # build and deploy www/Infraccount (wrangler deploy)
```

## What's configurable, and what isn't

Sign-in methods, access control (owner/admin/user), and OAuth provider settings are fixed in code (`infra/src/auth/index.ts`) rather than exposed as a settings page. Environment-specific values (secrets, trusted origins, the URL each app points at the other) go through `.env.local` locally and Cloudflare's secret store / `wrangler.jsonc` in production. This is a deliberate choice: Infra favors sensible defaults you change in code over a large "editable after setup" surface, since most of these settings shouldn't change often and shouldn't be one accidental toggle away from a security regression.
