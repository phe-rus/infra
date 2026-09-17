# Verify: settings page · spec 0001 · updated 2026-09-17

_Steps derived from spec 0001 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] As an admin, visit `/settings`, set an instance name, upload a logo and a favicon, set a support email, save → reload the page → all four persist → AC-1
- [ ] On a fresh instance (no row ever saved), sign out and visit `/sign-in` → title shows `env.VITE_APPNAME` (e.g. "Infra"), no logo image, no support email line → AC-2
- [ ] After saving a name and logo, sign out and visit `/sign-in` and `/setup` (if `hasAdmin` is false) → both show the new name/logo, no session required → AC-3
- [ ] Trigger a password reset (`/forgot-password`) → the received email's subject and body show the new display name, not the old default → AC-4
- [ ] After saving, open the `/_workspace` dashboard → sidebar and browser tab title show the new name/logo → AC-5
- [ ] With a support email set → outgoing email footer and the `/sign-in` page footer both show a `mailto:` link → clear the support email, save → both disappear → AC-6
- [ ] Signed out (or as a `user`-role account, if one exists), call `updateInstanceSettings` → expect a 403/redirect → the same caller can still load `/sign-in` (which calls `getInstanceSettings`) without error → AC-7
- [ ] Upload a logo, note its R2 key, upload a second logo → confirm (via `wrangler d1 execute` or the R2 browser) the first key is gone and only the new one remains; confirm the uploading admin's own personal quota (an existing user's avatar/file usage) is unchanged → AC-8
- [ ] Abandon an upload: pick a file in the logo picker but close the tab before saving → confirm no orphaned object remains under `instance/logo/` after a few seconds → AC-8
- [ ] Click "Remove" on a set logo/favicon, save → the sign in page falls back to no logo / the static favicon, and the R2 object is deleted → AC-9
- [ ] Submit the settings form with an invalid support email (e.g. `not-an-email`) → expect a validation error, no partial save (other fields unchanged) → AC-10
- [ ] Save two different fields from two sessions close together (e.g. one tab changes the name, another changes the support email, submitted within the same second) → both changes end up applied, no 500, no corrupted row → AC-11
- [ ] Attempt to upload a file over 2MB as the logo, and a non-image file (e.g. a `.pdf`) as the favicon → both rejected with a clear error, nothing saved → AC-12

## Commands

- [ ] `cd infra && bun run typecheck` → passes
- [ ] `cd shared/assets && bun run typecheck` → passes
- [ ] `cd accounts && bun run typecheck` → passes (confirms the shared package change doesn't break the other consumer)
- [ ] `bun run lint` (repo root) → clean, no new warnings from the touched files
- [ ] `bunx wrangler d1 execute infra-authentication --local --command "SELECT * FROM instanceSettings;"` → returns exactly one row after any save, never more

## Acceptance-criteria coverage

- AC-1 … covered by the first UI step · AC-2 … covered by the fresh-instance step · AC-3 … sign in/setup step · AC-4 … password reset email step · AC-5 … dashboard step · AC-6 … support email footer step · AC-7 … permission step · AC-8 … replace and abandoned-upload steps · AC-9 … remove/clear step · AC-10 … invalid email step · AC-11 … concurrent update step · AC-12 … oversized/wrong-type upload step
