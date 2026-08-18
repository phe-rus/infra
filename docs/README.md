<div align="center">
  <img src="./favicon.png" alt="Infra" width="96" height="96" style="border-radius: 50%;" />
  <h1 style="margin-top: 10px; margin-bottom: 5px;">Infra</h1>
  <p style="font-size: 1.1em; line-height: 1.6;">A centralized, self-hosted authentication server.</p>
</div>

Infra runs on your own Cloudflare account and is meant to be the thing every application you build points at to authenticate its users, instead of paying a per-user bill to Auth0, Clerk, Firebase Auth, or Supabase Auth.

Infra is open source, published by Pherus. Pherus uses it, but Infra is not Pherus's product: it's its own project, and anyone can deploy their own instance.

- **Self-hosted.** Runs entirely on your own Cloudflare account, Workers, D1, KV, and R2. Your users, your database, your uptime.
- **Centralized.** One Infra instance can serve every application you build, web, mobile, internal tools, APIs, instead of each app wiring up its own auth.
- **Built on solid, standard primitives.** Email and password, passkeys, and two-factor auth work out of the box, powered by [better-auth](https://www.better-auth.com).
- **A real OAuth 2.1 / OIDC provider**, not just its own proprietary sessions. Any application that speaks OAuth can register as a client and use Infra to sign users in, with a hosted login and consent screen (served by Infraccount, Infra's own end-user account app), a standard authorization-code + PKCE flow, and JWT-based access tokens.
- **A real admin console, not just a database.** A dashboard is included for managing every account on the instance, registering and managing OAuth applications, browsing object storage, and reviewing payments, so running it day to day doesn't mean writing SQL by hand.
- **Mobile-money payments**, via PawaPay: deposits, payouts, and refunds, with a receipt page for every transaction.

## Why a centralized auth server

There are two common ways people get auth today. Most open source projects are libraries you embed into a single application, tightly coupled to whatever database and framework that app already uses. The other option is a paid, centralized SaaS service like Auth0 or Clerk, where you don't run anything yourself, but you pay per user and trust someone else with the data.

Infra is a third option: a centralized auth server, the same shape as Auth0 or Clerk, except you deploy and run it on your own infrastructure. It can authenticate every application you build, not just one, the same way a hosted service would, without handing your users' data to a vendor.

Most self-hosted auth servers assume you have a server: something always running, that you provision, patch, and pay for by the month whether you're using it or not. Infra is built to not need that. The target is serverless, Cloudflare Workers today, with Vercel planned next. There's no box to rent or keep alive; you deploy to a platform you likely already use for the rest of your stack, and it scales with you instead of sitting there as a fixed monthly cost.

## Two apps, one instance

Infra ships as two apps: **`infra`**, the auth engine and admin dashboard for the instance owner, and **Infraccount** (`www`), a separate end-user "my account" app, the same split as an internal admin console versus `myaccount.google.com`. Infraccount is a pure client of `infra`, no auth logic of its own, and hosts every page an OAuth-connected app's users actually see mid-flow: sign-in, create-account, two-factor, consent. `infra` itself only renders first-run setup and the admin dashboard's own sign-in, see [Architecture](architecture.md) for how the two talk to each other.

Continue to **[Getting Started](getting-started.md)** to deploy your own instance. If you already have one running:

- **[Connect Your App](connect-your-app.md)**: OAuth 2.1/OIDC federation, for apps on a different domain than Infra. Code examples for TanStack Start, plain fetch/curl, SPAs and mobile, other frameworks, and machine-to-machine.
- **[Sign In, Sign Up, Passkeys & 2FA](authentication.md)**: the direct-client mode, for apps you own on the same root domain as Infra, sharing a real session instead of an OAuth token. Covers email/password, passkey registration and sign-in, and 2FA.
- **[Payments](payments.md)**: mobile-money deposits, payouts, and refunds via PawaPay, with real request/response examples.

Or the system-level docs:

- [Architecture](architecture.md): what's actually running, and where your data lives
- [OAuth Provider](oauth-provider.md): the concepts behind registering applications and the OAuth 2.1 / OIDC flow
