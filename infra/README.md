# infra

This is the auth engine: the real `betterAuth()` instance (all plugins, D1/KV/R2), the admin dashboard, and only the admin/owner-facing pages (`/setup`, admin `/sign-in`, `/forgot-password`). It's one package inside the `infra` monorepo, see the [root README](../README.md) for how it fits together with `accounts` (the end-user-facing app), `www` (the public marketing site), and the shared packages.

Infra is a centralized, self-hosted authentication server. It runs on your own Cloudflare account and is meant to be the thing every application you build points at to authenticate its users, instead of paying a per-user bill to Auth0, Clerk, Firebase Auth, or Supabase Auth.

Infra is open source, published by Pherus. Pherus uses it, but Infra is not Pherus's product. It is its own project, and anyone can deploy their own instance.

## What it does

- **Self-hosted.** Runs entirely on your own Cloudflare account: Workers, D1, KV, and R2. Your users, your database, your uptime.
- **Centralized.** One Infra instance can serve every application you build (web, mobile, internal tools, APIs) instead of each app wiring up its own auth.
- **Built on solid, standard primitives.** Email and password, passkeys, and two-factor auth work out of the box, powered by better-auth.
- **A real OAuth 2.1 / OIDC provider**, not just its own proprietary sessions. Any application that speaks OAuth can register as a client and use Infra to sign users in, with a hosted login and consent screen (served by `accounts/`, infra's own companion app), a standard authorization-code + PKCE flow, and JWT-based access tokens.
- **A real admin console, not just a database.** A dashboard is included for managing every account on the instance, registering and managing OAuth applications, and browsing object storage, so running it day to day doesn't mean writing SQL by hand.

## Approach

There are two common ways people get auth today. Most open source projects are libraries you embed into a single application, tightly coupled to whatever database and framework that app already uses. The other option is a paid, centralized SaaS service like Auth0 or Clerk, where you don't run anything yourself, but you pay per user and trust someone else with the data.

Infra is a third option: a centralized auth server, the same shape as Auth0 or Clerk, except you deploy and run it on your own infrastructure. It can authenticate every application you build, not just one, the same way a hosted service would, without handing your users' data to a vendor.

Most self-hosted auth servers assume you have a server: something always running, that you provision, patch, and pay for by the month whether you're using it or not. That's a real cost and a real operational burden, and it's often what pushes people back toward a paid SaaS instead. Infra is built to not need that. The target is serverless, Cloudflare Workers today, with Vercel planned next. There's no box to rent or keep alive, you deploy to a platform you likely already use for the rest of your stack, and it scales with you instead of sitting there as a fixed monthly cost.

Under the hood, Infra is built on better-auth, so sign-in flows (email and password, passkeys, two-factor) are handled by a library already trusted across the JS ecosystem rather than reimplemented from scratch, and the OAuth 2.1/OIDC provider layer is `@better-auth/oauth-provider`, a real spec-compliant implementation rather than a bespoke identity model.

One place Infra deliberately differs from more minimal auth toolkits: it does not hand user management back to your own application code. Infra owns accounts, roles, sessions, and OAuth clients directly, and ships a dashboard to manage all of it, because most people running their own auth server don't want to also build the admin tooling for it. Infra is deliberately just the auth/identity layer, though, the same split as Firebase Auth vs. Firebase's own billing: it doesn't own payments, and an app that needs them wires its own integration.

Data lives in Cloudflare D1 (accounts, sessions, OAuth clients), KV (rate limiting, session/config caching), and R2 (object storage, avatars and general files), all provisioned as part of your own Cloudflare account when you deploy. You should not need to query any of them directly; the dashboard and the auth API are the intended interface.

## Status

Working today:

- First-run setup (create the owner account) at `/setup`.
- Full user management: roles, bans, sessions, password resets, 2FA visibility and admin-side disable.
- A real OAuth 2.1 / OIDC provider: application registration, authorization-code + PKCE, JWT access tokens, managed from the **Console** page. The hosted login, create-account, and consent pages users see mid-flow are served by `accounts/`, not this app, see the root README for why.
- Object storage (**Storage** page): an admin browser over R2, with a public CDN endpoint.

Not built yet: a **Logs** page exists as a placeholder in the dashboard's navigation with no functionality behind it. There is no self-service API keys feature; it existed at one point and was removed as a deliberate scope decision.

## Running your own instance

This app is one package in a Turborepo monorepo, from the **repo root**:

```bash
bun install                              # installs every workspace package
cp infra/.env.example infra/.env.local   # fill in real secrets, see comments in the file
bun run dev                              # starts infra (:3000), accounts (:3001), www (:3002)
bun run build                            # production build, every package
bun run --cwd infra deploy               # build and deploy this app to your Cloudflare account
```

You need `infra` and `accounts` both running locally even if you're only working on the auth engine. Sign-in, create-account, and consent are pages `infra` redirects to, not pages it renders itself. See the [root README](../README.md) for `accounts`'s own env setup.

The first time you visit a fresh instance, you'll be walked through a short setup flow to create the owner account. Everything else, sign-in methods, access control, OAuth clients, is either fixed in code or configured through `.env.local`/`wrangler.jsonc` rather than a settings page, by design: this project favors sensible defaults you can change in code over a large "editable after setup" surface.
