# Scope: repo wide (_root)

Cross cutting infra shared by every app: the shared packages (`@infra/ui`, `@infra/assets`, `@infra/tanstack-image`, `@infra/minifybuild`, and the planned `@infra/icm`) and the root level monorepo tooling.

**Build approach:** Tracer Bullet (each new feature is built end to end through every layer until it works).
**Workflow:** Beta (after /develop: /check verify then /test; no fresh model review by default) as the default; a security sensitive piece of the push plugin can be tagged `· GA` if it warrants a fresh model review before it ships.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use /develop and skip /architect. You decide when a feature is done._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | @infra/ui component kit | Existing | existing |
| 2 | @infra/tanstack-image | Existing | existing |
| 3 | @infra/minifybuild | Existing | existing |
| 4 | @infra/assets import normalization | Existing | in-progress |
| 5 | Root tooling (Biome, Turbo, CI) | Existing | existing |
| 6 | @infra/icm push notifications plugin | Slice 1 | planned |

## Existing

### 1. @infra/ui component kit · existing
The one UI kit consumed by infra, accounts, and www: base-mira primitives on Base UI, the useAppForm/DataTable/DialogWidget/ComposeViewport widgets, theme hooks, and the global stylesheets. code in `shared/ui`

### 2. @infra/tanstack-image · existing
The edge cache image proxy, consumed by infra and www. code in `shared/tanstack-image`

### 3. @infra/minifybuild · existing
A Vite plugin orchestrating production build minification, consumed by infra, accounts, and www. code in `shared/minifybuild`

### 4. @infra/assets import normalization · in-progress
The object storage plugin itself is fully functional and consumed by infra and accounts. But `infra/auth/auth.ts`, `infra/domains/users/func.ts`, and `infra/domains/storage/func.ts` import it via relative paths straight into `shared/assets/src/...`, instead of the `@infra/assets` / `@infra/assets/server` package specifier that `accounts/lib/auth-client.ts` already uses correctly. Nothing is broken; it's an inconsistency worth fixing rather than copying into new call sites.
**Done when:** every infra call site imports `@infra/assets` or `@infra/assets/server` by package specifier, matching how accounts already does it.
- [ ] Normalize the imports: `/develop assets import normalization`
code in `infra/auth/auth.ts`, `infra/domains/users/func.ts`, `infra/domains/storage/func.ts`

### 5. Root tooling (Biome, Turbo, CI) · existing
One root `biome.json` for lint/format/check, `turbo.json` orchestrating dev/build/typecheck/deploy, and a GitHub Actions pipeline running lint, typecheck, build, and type generation.

## Slice 1: Push notifications

### 6. @infra/icm push notifications plugin · needs a decision
A self hosted push notification plugin (Web Push/VAPID, APNs, FCM, WNS), meant to follow the same injected dependency shape as `@infra/assets` (a binding and an `isAdmin` callback passed in, never assumed). A design direction is sketched in `infra/CLAUDE.md`'s known issues backlog (a D1 subscriptions table, an abuse log, rate limit rules, credentials setup), but no code exists yet. This is the foundation infra's push notification admin surface depends on (see the infra scope); build this first.
**Done when:** an app can subscribe a device, and the plugin can send a push through at least one real provider, exposed the same way `@infra/assets` exposes list/delete plus hand written upload actions.
- [ ] Design it (spec): `/architect push notifications plugin`

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Every other box is an execution box; `/architect` never ticks one.

- **Next step** = the first unticked box, always a command.
- **needs a decision** = run `/architect` first; otherwise straight to `/develop`.
- **Status**: `planned` → `in-progress` → `done`, plus `existing` (pre workflow, left alone by `/develop` and `/sync`) and `dropped` (kept for history).
- **Workflow tier tag** beside a heading overrides the project default for that one feature; no tag inherits Beta.
