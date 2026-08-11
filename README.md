# Infra

Infra is a centralized, self-hosted authentication server. It runs on your own Cloudflare account and is meant to be the thing every application you build points at to authenticate its users, instead of paying a per-user bill to Auth0, Clerk, Firebase Auth, or Supabase Auth.

Infra is open source, published by Pherus. Pherus uses it, but Infra is not Pherus's product. It is its own project, and anyone can deploy their own instance.

- **Self-hosted.** Runs entirely on your own Cloudflare account, Workers, D1, and KV. Your users, your database, your uptime.
- **Centralized.** One Infra instance can serve every application you build, web, mobile, internal tools, APIs, instead of each app wiring up its own auth.
- **Built on solid, standard primitives.** Email and password, magic links, email OTP, passkeys, two-factor auth, and API keys work out of the box, powered by better-auth. The direction we're building toward is a fully standards-based server, so any OAuth client can use Infra as its identity provider.
- **A real admin console, not just a database.** A dashboard is included for managing sign-in methods, deciding who is allowed into that dashboard, managing every account on the instance, and issuing API keys, so running it day to day doesn't mean writing SQL by hand.

## Approach

There are two common ways people get auth today. Most open source projects are libraries you embed into a single application, tightly coupled to whatever database and framework that app already uses. The other option is a paid, centralized SaaS service like Auth0 or Clerk, where you don't run anything yourself but you do pay per user and trust someone else with the data.

Infra is a third option: a centralized auth server, the same shape as Auth0 or Clerk, except you deploy and run it on your own infrastructure. It can authenticate every application you build, not just one, the same way a hosted service would, without handing your users' data to a vendor.

There are already self-hosted auth servers you could pick instead. Most of them assume you have a server: something always running, that you provision, patch, and pay for by the month, whether you're using it or not. That's a real cost and a real operational burden, and it's often what pushes people back toward a paid SaaS instead. Infra is built to not need that. The target is serverless: Cloudflare Workers today, with Vercel planned next. There's no box to rent or keep alive, you deploy to a platform you likely already use for the rest of your stack, and it scales with you instead of sitting there as a fixed monthly cost. Renting a server just to end up fronting it with Cloudflare anyway defeats the point of self-hosting in the first place; you're still trusting someone else to keep your users' data reachable. Infra's aim is to remove that step entirely.

Under the hood, Infra is built on better-auth, so sign-in flows (email and password, magic link, email OTP, passkeys, two-factor, API keys) are handled by a library already trusted across the JS ecosystem rather than reimplemented from scratch. Where we're heading, inspired by projects like OpenAuth, is a fully OAuth 2.0 compliant authorization server, so any client that speaks OAuth, not just apps written specifically for Infra, could use it as an identity provider and implement "log in with your account" flows. That part is a direction, not a finished feature yet. Today Infra issues its own sessions and API keys rather than OAuth tokens for third-party clients.

One place Infra deliberately differs from projects like OpenAuth: it does not hand user management back to your own application code. OpenAuth intentionally stays stateless and expects you to look up or create users yourself in a callback. Infra owns accounts, roles, bans, and sessions directly, and ships a dashboard to manage all of it, because most people running their own auth server don't want to also build the admin tooling for it.

Data lives in Cloudflare D1 (the account and session store) and KV (settings and configuration), both provisioned as part of your own Cloudflare account when you deploy. You should not need to query either directly; the dashboard and the auth API are the intended interface.

## Status

Working today: first-run setup, sign-in method and security configuration, role definitions and instance access control, full user management (roles, bans, sessions, impersonation, password resets), and self-service API keys.

Not built yet: database, storage, environment variables, logs, and billing pages exist as placeholders in the dashboard's navigation but have no functionality behind them.

## Running your own instance

```bash
bun install       # install dependencies
bun run dev       # start a local dev instance on port 3000
bun run build     # production build
bun run deploy    # build and deploy to your Cloudflare account
```

The first time you visit a fresh instance, you'll be walked through a setup wizard to configure your app name, sign-in methods, security settings, and create the owner account.
