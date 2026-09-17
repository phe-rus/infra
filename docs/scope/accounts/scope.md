# Scope: accounts

The end user "my account" app, serving account.pherus.org. Runs no auth server of its own, a pure consumer of infra's auth server via better-auth/react's createAuthClient.

**Build approach:** Tracer Bullet (each new feature is built end to end through every layer until it works).
**Workflow:** Beta (after /develop: /check verify then /test; no fresh model review by default). A feature can carry its own tag, e.g. `· GA`, to run more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use /develop and skip /architect. You decide when a feature is done._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Sign in and account creation | Existing | existing |
| 2 | Password reset | Existing | existing |
| 3 | Two factor sign in | Existing | existing |
| 4 | OAuth consent | Existing | existing |
| 5 | Dashboard home | Existing | existing |
| 6 | Profile | Existing | existing |
| 7 | Security: two factor management | Existing | existing |
| 8 | Security: passkeys | Existing | existing |
| 9 | Security: sessions and devices | Existing | existing |
| 10 | Delete account | Existing | existing |
| 11 | Locale support (i18n) | Slice 1 | in-progress |

## Existing

### 1. Sign in and account creation · existing
Email/password sign in with a passkey option and a remember me checkbox, plus registration with email verification. code in `accounts/src/routes/_auth/sign-in.tsx`, `accounts/src/routes/_auth/create-account.tsx`

### 2. Password reset · existing
Request and complete a token based password reset, with expiration handling. code in `accounts/src/routes/_auth/forgot-password.tsx`, `accounts/src/routes/_auth/reset-password.tsx`

### 3. Two factor sign in · existing
TOTP code verification during sign in with a trust this device option. code in `accounts/src/routes/_auth/two-factor.tsx`

### 4. OAuth consent · existing
The OAuth authorization screen showing the requesting client's name and URI with accept/deny. code in `accounts/src/routes/_protected/consent.tsx`

### 5. Dashboard home · existing
Account overview with avatar, name, email, and a search placeholder. code in `accounts/src/routes/_workspace/index.tsx`

### 6. Profile · existing
Editing personal info (name, bio, avatar) with read only credential display. code in `accounts/src/routes/_workspace/profile.tsx`

### 7. Security: two factor management · existing
Enable/disable TOTP with QR scanning, and backup code generation/regeneration. code in `accounts/domains/security/views/two-factor.tsx`

### 8. Security: passkeys · existing
Add, rename, and delete passkeys, platform or cross platform, with a list view. code in `accounts/domains/security/views/passkey.tsx`

### 9. Security: sessions and devices · existing
List active sessions with device/browser detection, IP, and sign in date; revoke other devices. code in `accounts/domains/security/views/session-list.tsx`

### 10. Delete account · existing
Permanent account deletion via password confirmation plus a confirmation email. code in `accounts/domains/security/views/delete-account-dialog.tsx`

Nothing partial or missing turned up in this workspace this pass; no next slice planned here yet. Run `/scope accounts <a feature>` to enroll a new one, or run `/scope` again once you have a next slice in mind.

### 11. Locale support (i18n) · in-progress
Real i18n for accounts, mirroring www's Paraglide setup: en (unprefixed), zh (`/zh/`), fr (`/fr/`), across every accounts page. infra is explicitly out of scope (admin only dashboard).
**Done when:** a visitor can select en/zh/fr from a locale switcher on any accounts page, and every route's UI chrome renders in that language at the matching URL prefix.
- [x] Design it (spec): [0001](../../specs/accounts/0001-locale-support.md) (assumed, not yet ratified)
- [x] Build it: `/develop locale for accounts`
  - [x] Paraglide mechanism (install, project.inlang config, vite plugin, generated src/paraglide/, locale switcher component)
  - [x] Wire `__root.tsx` (lang/dir passthrough, matching www's ComposeViewport convention) plus `components/headers.tsx`
  - [x] Translate the OAuth hosted pages (sign-in, create-account, two-factor, consent, forgot-password, reset-password)
  - [x] Translate the end user account surfaces (`_workspace` index, profile, security's 4 composed views)
- [ ] Verify it: `/check verify locale for accounts`
- [ ] Test it: `/test locale for accounts`
code in `accounts/project.inlang/`, `accounts/messages/`, `accounts/src/routes/`, `accounts/components/headers.tsx`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Instance branding on accounts' own sign in page**: infra's settings page (spec [0001](../../specs/infra/0001-settings-page-branding/index.md)) only applies the instance's display name/logo to infra's own admin sign in page, not accounts' end user facing one · needs a decision · from spec 0001 (infra)

## Legend

- **Status**: `planned` → `in-progress` → `done`, plus `existing` (pre workflow, left alone by `/develop` and `/sync`) and `dropped` (kept for history).
- **Workflow tier tag** beside a heading overrides the project default for that one feature; no tag inherits Beta.
