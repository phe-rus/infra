# infra

📖 **[Documentation](https://phe-rus.github.io/infra/)**

A centralized, self-hosted authentication server. It runs on your own Cloudflare account and is meant to be the thing every application you build points at to authenticate its users, instead of paying a per-user bill to Auth0, Clerk, Firebase Auth, or Supabase Auth.

Infra is open source, published by Pherus. Pherus uses it, but Infra is not Pherus's product — it's its own project, and anyone can deploy their own instance.

This repo is a Turborepo monorepo (bun workspaces):

- **[`infra/`](infra)** — the auth engine. The real `betterAuth()` instance (all plugins, D1/KV/R2), the admin dashboard, and only the admin/owner-facing pages: `/setup`, admin `/sign-in`, `/forgot-password`. See [`infra/README.md`](infra/README.md).
- **`www/`** ("Infraccount") — the end-user "my account" app, the same idea as myaccount.google.com. It runs no auth server of its own; it's a pure client of `infra` via `better-auth/react`'s `createAuthClient`. This is where the OAuth provider's hosted pages actually live — `/sign-in`, `/create-account`, `/two-factor`, `/consent` — plus the end-user's own account management (currently a single **Infro** page: name, bio, avatar). `infra`'s `oauthProvider` config points its `loginPage`/`consentPage`/`signUp.page` here rather than hosting them itself.
- **`shared/ui`** (`@infra/ui`) — the one UI kit, consumed by both apps. Neither app owns its own copy of components.
- **`plugins/r2`** (`@infra/r2`) and **`plugins/payment`** (`@infra/payment`) — infra's two custom better-auth plugins (object storage, PawaPay mobile-money payments), extracted into standalone packages with both server and client exports so `www` (or any third-party consumer) can call them too, not just `infra`'s own in-process `auth.api.*`.

## Why two apps

Infra used to be a single app doing everything: the admin dashboard *and* the hosted OAuth login/consent/sign-up pages a connected app's users see. That coupled two very different audiences — the instance owner managing the platform, and any end user of any connected app — into one surface. Splitting them means `infra` only ever needs to authenticate its own admins/owners, and `www`/Infraccount is the one place an end user (of *any* app pointed at this instance) signs in, manages passkeys/2FA, and eventually manages payments — the same shape as how Google separates the internal admin console from `myaccount.google.com`.

## Running locally

```bash
bun install                              # installs every workspace package
cp infra/.env.example infra/.env.local   # infra's secrets — see comments in the file
cp www/.env.example www/.env.local       # www's config (points at infra's URL)
bun run dev                              # starts infra (:3000) and www (:3001) together
```

Whenever you edit an `.env`/`.env.local` file, re-run `bun run type-gen` and fully restart the dev server — Vite's own file-watcher restart isn't enough for Cloudflare Worker bindings/secrets to pick up the change.

```bash
bun run build       # production build, every package
bun run typecheck   # tsc --noEmit, every package
```

See [Getting Started](https://phe-rus.github.io/infra/#/getting-started) for prerequisites and first-run setup, or the full [docs site](https://phe-rus.github.io/infra/) for architecture, the OAuth provider, and payments.

## Deploying

`infra` and `www` are each their own Cloudflare Worker, deployed independently:

```bash
bun run --cwd infra deploy
bun run --cwd www deploy
```

`docs/` stays at the repo root (not nested under `infra/`) since GitHub Pages serves it as a root-level `/docs` folder.
