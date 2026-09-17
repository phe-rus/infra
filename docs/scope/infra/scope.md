# Scope: infra

The real auth server (the betterAuth engine, all plugins, D1/KV/R2), the admin dashboard, and the admin facing pages (/setup, admin /sign-in, /forgot-password).

**Build approach:** Tracer Bullet (each new feature is built end to end through every layer until it works).
**Workflow:** Beta (after /develop: /check verify then /test; no fresh model review by default). A feature can carry its own tag, e.g. `· GA`, to run more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use /develop and skip /architect. You decide when a feature is done._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Admin auth and setup | Existing | existing |
| 2 | User management | Existing | existing |
| 3 | Authentication methods | Existing | existing |
| 4 | OAuth 2.1 / OIDC provider | Existing | existing |
| 5 | File storage and CDN | Existing | existing |
| 6 | Analytics and audit logging | Existing | existing |
| 7 | Admin dashboard shell | Existing | existing |
| 8 | Systems utils wiring | Existing | in-progress |
| 9 | Settings page | Slice 1 | planned |
| 10 | Push notification admin surface | Slice 1 | planned |

## Existing

### 1. Admin auth and setup · existing
Admin sign in, one time setup (first admin creation with email verification and pending migrations UI), and the password reset flow. code in `infra/src/routes/_auth`, `infra/auth/auth.ts`

### 2. User management · existing
Full admin control over users: create, update profile, role assignment, ban/unban, force password reset, session revocation, impersonation, disabling a user's two factor, and avatar upload on a user's behalf. code in `infra/domains/users`

### 3. Authentication methods · existing
Two factor TOTP with backup codes, passkeys/WebAuthn, email verification on account creation, and Have I Been Pwned password checking in production. code in `infra/auth/auth.ts`

### 4. OAuth 2.1 / OIDC provider · existing
OAuth application CRUD, client secret rotation, enable/disable, redirect URI/scope/grant type management, the discovery endpoints, and the JWKS endpoint. code in `infra/domains/console`, `infra/src/server.ts`

### 5. File storage and CDN · existing
R2 object browser, multipart upload with type validation, avatar upload, admin wide deletion, an on demand storage quota, SVG sanitization on upload, and the public unauthenticated CDN read path. code in `infra/auth/auth.ts` (assets plugin), `infra/domains/storage`, `infra/src/routes/api/cdn`

### 6. Analytics and audit logging · existing
An event log with a sliding window, IP geolocation on events, event metrics and trends, and Cloudflare Analytics Engine queries. code in `infra/domains/stats`

### 7. Admin dashboard shell · existing
Dashboard home, the navigation sidebar, the protected workspace layout with admin middleware, and query prefetch on load. code in `infra/src/routes/_workspace`

### 8. Systems utils wiring · in-progress
The health check and app version/runtime endpoints already exist in `func.ts`, but `use-system.ts` is an empty stub and none of it is wired into a route or a dashboard page yet.
**Done when:** the existing health check and version endpoints are reachable from a route, and the dashboard shows them somewhere (or this row is explicitly dropped instead).
- [ ] Finish and wire what's already there: `/develop systems utils wiring`
code in `infra/domains/systems-utils`

## Slice 1: Admin gaps

### 9. Settings page · needs a decision
The route and sidebar link already exist; the page currently renders a placeholder greeting with no real content. What belongs on it (security policy knobs, rate limit tuning, branding, something else) hasn't been decided yet.
**Done when:** admins can view and change a real, defined set of settings, and changes persist.
- [ ] Design it (spec): `/architect settings page`

### 10. Push notification admin surface · needs a decision
Admin UI for viewing subscribed devices and sending push notifications, once the shared plugin exists. Depends on `@infra/icm` (see the repo wide scope) being built first; do not start this before that lands.
**Done when:** an admin can see subscribed devices and trigger a notification, backed by the real plugin, not a stub.
- [ ] Design it (spec): `/architect push notification admin surface`

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Every other box is an execution box; `/architect` never ticks one.

- **Next step** = the first unticked box, always a command.
- **needs a decision** = run `/architect` first; otherwise straight to `/develop`. The tag drops once the spec is captured.
- **Status**: `planned` → `in-progress` → `done`, plus `existing` (pre workflow, left alone by `/develop` and `/sync`) and `dropped` (kept for history).
- **Workflow tier tag** beside a heading overrides the project default for that one feature; no tag inherits Beta.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
