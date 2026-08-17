# Architecture

Infra ships as two TanStack Start (React 19, server-rendered) applications, each its own Cloudflare Worker:

- **`infra`** — the real `betterAuth()` instance (all plugins, D1/KV/R2 bindings live here) and the admin dashboard. The same Worker serves both the dashboard UI and the better-auth HTTP API — there's no separate backend service to run or deploy. It hosts only the admin/owner-facing pages: first-run `/setup`, admin `/sign-in`, `/forgot-password`.
- **`www`** ("Infraccount") — the end-user "my account" app. It runs no auth server of its own; it's a pure client of `infra` via better-auth's own client SDK. This is where the OAuth provider's hosted pages actually live (`/sign-in`, `/create-account`, `/two-factor`, `/consent` — the pages a connected app's users see mid-flow), plus end-user account management. `infra`'s OAuth provider config points `loginPage`/`consentPage`/`signUp.page` at `www`'s URLs rather than hosting them itself.

Both apps talk to the same `infra` Worker over HTTP (CORS-enabled for `www`'s origin); only `infra` ever touches D1/KV/R2 directly.

## Where data lives

- **D1** (SQLite) — accounts, sessions, OAuth clients/tokens/consents, payment records. This is the source of truth.
- **KV** — rate limiting, session cache, and short-lived config caches (PawaPay's active configuration, FX rates). Nothing here is authoritative; it's all safe to lose.
- **R2** — object storage. Avatars and general file uploads, served back out through a public CDN endpoint.

You should not need to query any of these directly day to day — the dashboard and the auth API are the intended interface.

## Identity

Sign-in itself (email/password, passkeys, two-factor) is handled by [better-auth](https://www.better-auth.com), rather than reimplemented from scratch. Three fixed roles exist: **owner** (the account created during first-run setup — full control, including promoting/demoting other accounts), **admin** (broad operational access: manage users, OAuth applications, payments), and **user** (a plain authenticated account with no dashboard access at all — this is the role every self-service signup gets, including anyone signing up through a connected application's OAuth flow).

## Acting as an OAuth 2.1 / OIDC provider

Infra can be the identity provider for other applications, not just its own dashboard. This is a real, spec-compliant implementation (`@better-auth/oauth-provider`), not a bespoke token scheme: standard discovery endpoints (`/.well-known/openid-configuration`, `/.well-known/oauth-authorization-server`), authorization-code + PKCE, a hosted login and consent screen, and JWT access tokens verifiable against a published JWKS. See [OAuth Provider](oauth-provider.md) for how to register a client and what an authorization flow looks like end to end.

## Object storage

A generic, reusable R2 plugin backs avatar and file uploads. Uploads are validated by sniffing the actual file bytes (not trusting the extension or a client-declared content type), and SVGs are sanitized on upload to strip scripts and event handlers. Every object is reachable through one public CDN endpoint by its exact key — there's no separate "download" endpoint.

## Payments

A PawaPay-backed plugin handles mobile-money deposits, payouts, and refunds. See [Payments](payments.md) for details, including webhook signature verification.

## Rate limiting

Every request is limited per client IP, using [better-auth's built-in rate limiter](https://www.better-auth.com/docs/concepts/rate-limit) backed by KV. Payments (`/pay/*`), object storage (`/r2/*`), and the public CDN endpoint (`/cdn/**`) each track their own independent budget, separate from the platform-wide default and from each other — a burst against one doesn't eat into another's quota.
