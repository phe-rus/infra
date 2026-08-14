# Getting Started

Infra deploys to your own Cloudflare account. There's no separate server to provision — Workers, D1, KV, and R2 are all created as part of your account when you deploy.

## Prerequisites

- A Cloudflare account (Workers, D1, KV, and R2 are all available on the free tier to start)
- [Bun](https://bun.sh) as the package manager
- A [Resend](https://resend.com) API key, for transactional email (verification, password reset, account deletion, payment receipts)
- If you want mobile-money payments: a [PawaPay](https://pawapay.io) sandbox or production API token

## Install and run locally

```bash
bun install                          # install dependencies
cp .dev.vars.example .dev.vars       # fill in real secrets — see comments in the file
bun run dev                          # start a local dev instance on port 3000
```

`.dev.vars` holds every secret the app needs locally (database/KV/R2 bindings are provisioned automatically by Wrangler in dev). It is never committed — `.dev.vars.example` documents every key you need to fill in.

## First run

The first time you visit a fresh instance, you're walked through a short setup flow (`/setup`) to create the **owner** account — the one account with full control over the instance. Every account created after that (through the dashboard, or through an OAuth-connected application's sign-up flow) gets the plain `user` role by default and cannot access the admin dashboard.

## Deploy

```bash
bun run build      # production build
bun run deploy      # build and deploy to your Cloudflare account (wrangler deploy)
```

## What's configurable, and what isn't

Sign-in methods, access control (owner/admin/user), and OAuth provider settings are fixed in code (`src/auth/index.ts`) rather than exposed as a settings page. Environment-specific values — secrets, the PawaPay environment, trusted origins — go through `.dev.vars` locally and Cloudflare's secret store / `wrangler.jsonc` in production. This is a deliberate choice: Infra favors sensible defaults you change in code over a large "editable after setup" surface, since most of these settings shouldn't change often and shouldn't be one accidental toggle away from a security regression.
