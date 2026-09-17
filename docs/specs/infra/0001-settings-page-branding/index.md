# 0001. Instance branding on the settings page

**Date**: 2026-09-17
**Status**: In Progress

## Summary

This spec designs the settings landing page for infra's admin dashboard, currently an empty placeholder. It lets an admin set the instance's display name, logo, favicon, and support email, and have those show up on the sign in page, in outgoing emails, and in the dashboard itself, all without a redeploy. Security policy and rate limit settings were considered too but are left for a later, separate decision since they touch a harder problem: making better auth's (the auth engine this app runs) startup configuration change live instead of fixed at deploy time. This also adds one small new upload endpoint to the shared `@infra/assets` package so branding files don't eat into an individual admin's personal storage limit.

## Requirements

**User stories**:
- As an admin, I want to set the instance's display name, logo, favicon, and support email, so the auth server reflects my organization instead of generic defaults.
- As an admin, I want a branding change to take effect immediately across sign in, dashboard, and emails, so I don't need a redeploy for a cosmetic change.
- As anyone hitting the sign in page, including before I've signed in, I want to see the real instance branding, so the experience feels legitimate.

**Acceptance criteria**:
- **AC-1**: An admin can set or update display name, logo, favicon, and support email from the settings page, and the changes persist across requests.
- **AC-2**: Before any admin ever sets a value (a fresh instance), display name falls back to `env.VITE_APPNAME`, logo renders nothing, favicon falls back to the existing static `/favicon.svg`/`.png`/`.ico` files, and support email is hidden entirely. Nothing looks broken.
- **AC-3**: The current display name and logo appear on infra's own sign in and setup pages (`_auth` routes), viewable without authentication.
- **AC-4**: The current display name appears in the subject and body of every outgoing email (verification, password reset, delete account confirmation), replacing the hardcoded `env.VITE_APPNAME` references in `emails.ts`.
- **AC-5**: The current display name and logo appear in the admin dashboard sidebar and browser tab title.
- **AC-6**: Support email, when set, appears as a mailto link in the outgoing email footer and the sign in page footer; when cleared, it disappears from both.
- **AC-7**: Only an admin can update settings or upload logo/favicon. Reading settings requires no authentication, since the sign in page must render before login.
- **AC-8**: Uploading a new logo or favicon deletes the previous object from R2 (object storage) as part of the replace, and never counts against any individual admin's personal `@infra/assets` storage quota. An upload that never ends up attached to a saved settings row (the form is abandoned, or the save is rejected) does not leave an orphaned object behind.
- **AC-9**: Clearing a field, including explicitly removing a logo or favicon, reverts that surface to its AC-2 fallback immediately, no redeploy needed, and deletes the now unused R2 object for a cleared logo/favicon.
- **AC-10**: Support email, when provided, must be a syntactically valid email address; an invalid value is rejected with a clear error, never silently stored.
- **AC-11**: Two admins updating different fields at close to the same time: each field's later write persists independently (a field not included in an update is left untouched, not cleared), no error, no corrupted row.
- **AC-12**: A logo or favicon upload is rejected if it exceeds the existing 2MB max file size or isn't an allowed image type (png/webp/jpg/svg), sniffed from the actual bytes, matching `@infra/assets`' existing validation exactly.

## Decision

**Chosen option**: A D1 settings table plus a new instance scoped upload endpoint in @infra/assets

Add an `instanceSettings` D1 table for the branding fields, and a small additive `uploadInstanceAsset` endpoint to `@infra/assets` so logo/favicon uploads never touch a user's personal storage quota.

> **Amendment, during `/develop`:** the engineer objected to reading/writing `instanceSettings` via raw Drizzle calls inside a plain TanStack Start helper, both on principle (every other custom mutation in this app goes through `auth.api.*`, not `db` directly) and because it's what actually broke the client build (a module level helper touching `cloudflare:workers`' `env` outside any `createServerFn` handler can't be stripped from the browser bundle, unlike code that lives inside a real endpoint handler). The settings data now lives behind a real, local better-auth plugin, `infra/auth/plugins/settings.ts` (`settings({ appName, isAdmin, binding })`, the same injected-dependency shape as `@infra/assets`, registered in `infra/auth/auth.ts`'s `plugins` array), exposing `getInstanceSettings`/`updateInstanceSettings` as real `createAuthEndpoint`s, callable in-process via `auth.api.getInstanceSettings()`/`auth.api.updateInstanceSettings()` exactly like every other domain already calls `auth.api.*`. The table itself is no longer a hand written Drizzle schema (`infra/schemas/settings.ts` is gone); it's declared as the plugin's own `schema` field and generated into `schemas/auth.ts` by `bun run auth:gen`, the same as every better-auth-owned table. `infra/domains/settings/func.ts` is now a thin `createServerFn` wrapper around the plugin's endpoints (unchanged client-facing shape: `get-settings.ts`/`use-settings.ts`/`views/settings-form.tsx` didn't need to change at all). One consequence: the row's `id` is better-auth's own adapter-generated string id, not a fixed `1`; singleton-ness is enforced in the plugin's own handler logic (read the one existing row if any, `create` if none, `update` if one exists) rather than a fixed primary key. The sections below are updated to match; `rationale.md` still records the original Option 1/2/3 comparison, which remains the right call at the "D1 versus KV versus reusing `uploadFile` as is" level, this amendment only changes how the D1 table itself is read and written.

## Rationale

Reasoning and options considered: see `rationale.md`.

## Feature design

**Data model sketch**:

`instanceSettings` (a real better-auth plugin table, declared as the `settings` plugin's own `schema` in `infra/auth/plugins/settings.ts`, generated into `schemas/auth.ts` by `bun run auth:gen` like every other better-auth-owned table), at most one row:

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | text, primary key | no | Adapter generated, like every other better-auth table; not fixed, singleton enforced in the plugin's handler logic instead |
| `displayName` | text | yes | Falls back to `env.VITE_APPNAME` when null |
| `logoKey` | text | yes | R2 key under the new `instance/` prefix, shaped `instance/logo-<uuid>.<ext>` (a fresh key every upload, the extension carried in the key itself so no separate mime column is needed); null = no logo |
| `faviconKey` | text | yes | Same shape, `instance/favicon-<uuid>.<ext>`; null = fall back to the static `/favicon.*` files |
| `supportEmail` | text | yes | null = support line hidden everywhere |
| `updatedAt` | integer (timestamp_ms) | no | Set on every write |
| `updatedBy` | text | yes | References `user.id`; better-auth's plugin schema generator defaults this to `onDelete: "cascade"` (no per-field override available), so deleting that admin's account deletes the settings row too, which just resets the instance back to its unset fallback state (AC-2), an acceptable simplification over the originally planned `set null` |

No relationships beyond `updatedBy` pointing at the existing `user` table.

**State transitions**: none. Fields update independently via a simple upsert against the single row; there's no lifecycle to model.

**API surface**:

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `getInstanceSettings` (real `createAuthEndpoint` in the `settings` plugin, `GET /settings/instance`; `infra/domains/settings/func.ts` wraps it in a `createServerFn` for route loaders, and `emails.ts` calls `auth.api.getInstanceSettings()` directly) | read | none | `displayName`, `logoUrl`, `faviconUrl`, `supportEmail` (already resolved: `displayName` always non-null, falling back to `env.VITE_APPNAME` internally; `logoUrl`/`faviconUrl` null or a CDN URL; `faviconUrl` null means "use the static file") | public, no session | a D1 read failure returns the same all-null defaults as an unset row (AC-2), it never throws or blanks the page |
| `updateInstanceSettings` (real `createAuthEndpoint` in the `settings` plugin, `POST /settings/instance`; `infra/domains/settings/func.ts` wraps it in an `AdminMiddleware`-gated `createServerFn`) | write | `displayName?`, `supportEmail?`, `logoKey?`, `faviconKey?`; a field left out of the payload is untouched, a field explicitly sent as `null` clears it | the updated row | admin (checked twice: the plugin's `isAdmin` callback, and `AdminMiddleware` on the TanStack wrapper) | 400 invalid email; if the write itself fails after a `logoKey`/`faviconKey` was included, the just-uploaded object is deleted before the error is returned, so a rejected save never leaves an orphaned upload; 403 not admin |
| `uploadInstanceAsset` (new, `@infra/assets`) | `POST /assets/instance-upload`, multipart | `file`, `slot: "logo" \| "favicon"` | `{ key, url }`; also deletes whichever prior object occupied that `slot`, since only this endpoint knows the `instance/` prefix and current key | admin (`isAdmin` callback) | 400 bad file type/size, 403 not admin |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Render sign in page, dashboard, email | Display name | Resolved once, inside `getInstanceSettings`: `instanceSettings.displayName`, falling back to `env.VITE_APPNAME` when null (or on a D1 read failure); callers always receive a non-null string |
| Render sign in page, dashboard, email header | Logo URL | Resolved inside `getInstanceSettings`: `cdnUrl(baseURL, instanceSettings.logoKey)`, using better-auth's configured `baseURL` as the origin (there's no incoming request to derive one from inside `emails.ts`'s callback); null when `logoKey` null |
| Render `<link rel="icon">`, email `<img>` | Favicon/logo URL, and its `type` attribute | Same `cdnUrl` resolution as the logo; `faviconKey` null falls back to the existing static `/favicon.svg` path. The image's mime type is derived from the extension already carried in the key (`instance/logo-<uuid>.png` → `image/png`), no separate mime column needed |
| Render email footer, sign in footer | Support email | `instanceSettings.supportEmail`, hidden when null |
| Audit the update | Acting admin's id | `ctx.context.session.user.id`, from the `AdminMiddleware`-gated session |
| Replace logo/favicon | The prior object to delete | `uploadInstanceAsset` itself deletes whatever object currently occupies the target `slot` before writing the new one; `updateInstanceSettings` never reads or deletes R2 objects on replace, it only records the new key |
| Clear logo/favicon (explicit `null`) | The now unused object to delete | `updateInstanceSettings` reads the row's current `logoKey`/`faviconKey` before overwriting it with `null`, and deletes that object |
| A settings save that fails after a fresh upload | The orphaned object to delete | `updateInstanceSettings` deletes the `logoKey`/`faviconKey` it was just handed in the request body before returning the error, so a rejected save never strands an upload |

**Key invariants**:
- At most one `instanceSettings` row ever exists; the plugin's own handler enforces this (read the one existing row if any, `create` if none, `update` it by its adapter assigned id if one exists), never a fixed primary key.
- A field left out of an `updateInstanceSettings` payload is untouched; a field explicitly sent as `null` clears it. These are not the same request shape, and the endpoint must tell them apart (`undefined` vs `null` on the patch object passed to the adapter).
- `logoKey`/`faviconKey`, when set, always point to an object under the `instance/` prefix, never a user scoped key, and always carry a fresh, unique filename (`instance/<slot>-<uuid>.<ext>`), never a fixed name reused across uploads, so a stale CDN cached copy is never served after a replace.
- No R2 object under `instance/` is ever orphaned: `uploadInstanceAsset` deletes the prior occupant of its `slot` on replace, `updateInstanceSettings` deletes the current object on an explicit clear, and deletes a just-uploaded object if the save that would have referenced it fails.
- `supportEmail`, when set, is a syntactically valid email address, checked by one shared `zod` schema used by both the `useAppForm` field and the server fn, so client and server never disagree on what's valid.
- `env.VITE_APPNAME` stays authoritative for the cookie prefix and any technical use; `instanceSettings.displayName` only governs what's shown to people, never overrides it.
- A D1 read failure on `getInstanceSettings` never surfaces as an error to a caller; it returns the same fallback values as an unset row (AC-2), since the sign in page depends on this succeeding for every visitor.

**Security model**:
- Read (`getInstanceSettings`): public, no session required, since the sign in page renders before authentication. No sensitive data in the row, safe to expose fully.
- Write (`updateInstanceSettings`): admin tier only, checked twice (defense in depth, matching every other admin mutation in this app): the plugin endpoint itself checks the injected `isAdmin` callback, and the TanStack wrapper in `infra/domains/settings/func.ts` also runs behind `AdminMiddleware`.
- Upload (`uploadInstanceAsset` in `@infra/assets`): admin tier only via the plugin's `isAdmin` callback, unconditionally (unlike the existing self service `uploadFile`, which is any authenticated user).
- No compliance scope triggered: support email is a business contact address, not an end user's personal data.

**Configuration required**: none. Reuses the existing D1 and R2 bindings; no new env vars or credentials.

**Critical test scenarios**:
- Happy path: admin sets a display name and uploads a logo; the sign in page and an outgoing verification email both reflect the change with no redeploy, verifies **AC-1**, **AC-3**, **AC-4**.
- Failure case: two admins submit conflicting updates within the same second; the later write persists, no corruption, no server error, verifies **AC-11**.
- Auth/permission: a non-admin (or unauthenticated) request to `updateInstanceSettings` is rejected with 403; the same caller still succeeds calling `getInstanceSettings`, verifies **AC-7**.

## Build plan

1. Add a real better-auth plugin, `infra/auth/plugins/settings.ts` (`settings({ appName, isAdmin, binding })`), declaring `instanceSettings` as its own plugin `schema` (fields only, no fixed id); register it in `infra/auth/auth.ts`'s `plugins` array. Generate the table into `schemas/auth.ts` (`bun run auth:gen`) and apply the migration (`bun run local`, i.e. `db:gen` + `db:local`/`db:remote`), satisfies **AC-1**.
2. The plugin's `getInstanceSettings`/`updateInstanceSettings` endpoints do the actual read/write (singleton enforced in the handler: read the one row if any, `create` if none, `update` if one exists; per-field upsert honoring the omitted-vs-null distinction; a D1 read failure returns AC-2's defaults instead of throwing), with a short (about 30 seconds) in memory memo in front of reads since it's called on every sign in page load and every outgoing email. `infra/domains/settings/func.ts` wraps both as thin `AdminMiddleware`-gated `createServerFn`s calling `auth.api.getInstanceSettings()`/`auth.api.updateInstanceSettings()` in-process, the same pattern every other domain already uses for `auth.api.*`, plus the domain's `get-settings.ts`/`use-settings.ts`/`index.ts` barrel. `updateInstanceSettings` calls `logManagementEvent` for audit parity with other admin mutations, satisfies **AC-1**, **AC-7**, **AC-10**, **AC-11**.
3. Wire `displayName` into `infra/auth/emails/emails.ts` by calling `auth.api.getInstanceSettings()` directly (it runs inside a better-auth callback, not a route loader, so it can't call the TanStack server fn; `emails.ts` importing `auth` from `@/auth`, which itself imports `emailHooks` from `./emails`, is a circular import that's safe here since `auth` is only dereferenced inside a callback invoked well after both modules finish loading, never at either module's top level), falling back to `env.VITE_APPNAME` when unset, as the thin, end to end first slice, satisfies **AC-4**, **AC-2**.
4. Add `uploadInstanceAsset` to `@infra/assets` (`shared/assets/src/index.ts`, the plugin's own endpoints; the `instancePrefix`/`instanceAssetKey` helpers added to `r2-paths.ts` and re-exported from `server.ts`): an admin-only endpoint writing to the fixed `instance/` prefix under a fresh `instance/<slot>-<uuid>.<ext>` key every call, outside the per-user quota, deleting whichever prior object occupied that `slot` before writing the new one, reusing the existing file type sniffing and SVG sanitization; export it from `@infra/assets/client` for other apps, satisfies **AC-1**, **AC-8**, **AC-12**.
5. Wire `logoKey`/`faviconKey` through `getInstanceSettings`'s response (resolved via `cdnPath` using the row's `updatedAt` as the cache-busting version, mime type derived from the key's extension) and add `updateInstanceSettings`'s two remaining cleanup paths: delete the current object on an explicit clear, and delete a just-uploaded key if the save it was attached to fails. `infra/domains/settings/func.ts`'s own upload wrappers call `auth.api.uploadInstanceAsset({ headers, body: { file, slot } })` in-process rather than reimplementing the upload logic, satisfies **AC-1**, **AC-8**, **AC-9**.
6. Build the settings page UI (`infra/src/routes/_workspace/settings/index.tsx`, `infra/domains/settings/views/settings-form.tsx`): a `useAppForm` form (name, logo upload, favicon upload, support email) inside the existing `ViewController` shell, matching the pattern every other dashboard page already uses, satisfies **AC-1**, **AC-10**.
7. Apply display name and logo to the sign in/setup pages and to the dashboard sidebar/browser tab title, reading `getInstanceSettings` once in the root layout loader (`__root.tsx`), since it's the one ancestor of both `_auth` and `_workspace`, rather than per route, satisfies **AC-3**, **AC-5**, **AC-2**.
8. Apply support email to the email footer and the sign in page footer, satisfies **AC-6**, **AC-2**.

## Consequences

**Positive**:
- Admins can rebrand the instance without a redeploy, and the change is instantly consistent across sign in, dashboard, and email.
- Establishes the first custom, app-owned D1 table (`schemas/settings.ts`), a pattern future settings work (security policy, rate limits, both explicitly deferred) can follow.
- The new `@infra/assets` endpoint is a small, genuinely reusable addition, not a one-off workaround.

**Negative / tradeoffs**:
- This is the first change to `@infra/assets`, a shared package `accounts` also depends on; it must ship and typecheck cleanly there too, even though `accounts` doesn't call the new endpoint yet (confirmed clean during the build).
- Every branding-affected page and email now depends on a D1 read at render/send time instead of a compile time constant, mitigated by a short in memory memo per Worker isolate (task 2) so it's not a read on every single request.
- A corrupted or momentarily unreachable custom favicon object could make the tab icon briefly disappear; mitigate by falling back to the static file on a failed CDN read (captured as Follow-up, not built in this pass).

**Neutral**:
- Security policy and rate limit tuning were considered for this same page but are explicitly out of scope for this build.
- infra's own settings page calls the upload logic directly against R2 (reusing `@infra/assets/server`'s validation helpers) rather than through the new plugin endpoint over HTTP, matching how `infra`'s existing avatar upload already works; the plugin endpoint itself still exists as specced, for `accounts` or any future app to call.

## Follow-up

- [ ] Security policy and rate limit tuning were raised for this settings page but deferred; they need their own `/architect` pass later, since making `auth.ts`'s currently static configuration dynamically read is a materially different, larger problem than this branding slice.
- [ ] No root `AGENTS.md` exists yet in this repo (only `CLAUDE.md` files); this spec was written from `CLAUDE.md` plus a live read of the relevant code. Consider running `/audit` to bootstrap real `AGENTS.md` files, since later workflow skills read that file, not `CLAUDE.md`.
- [ ] `accounts`' own end user facing sign in page (a separate workspace, not `infra`) was not brought into this spec's branding surfaces. If that page should also reflect instance branding, that's a follow-up feature in the `accounts` workspace, not an extension of this one.
- [ ] This build includes a short (about 30 second) in memory memo per Worker isolate in front of `getInstanceSettings`, since it's read on every sign in page load and every outgoing email. If that turns out not to be enough (e.g. cold starts still show a noticeable D1 read rate), consider a cross isolate cache (KV) next; not built now, to avoid optimizing before there's a measured problem beyond what the memo already addresses.
- [ ] The favicon fallback on a failed CDN read (a `faviconKey` is set but the object itself 404s or is unreachable) isn't explicitly handled; the browser is left to its own default behavior. Confirm whether this needs an explicit fallback before/during `/check verify`.
