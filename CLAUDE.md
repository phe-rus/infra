# CLAUDE.md

This is a Turborepo monorepo (bun workspaces: `["infra", "www", "plugins/*"]`).

- **`infra/`** — the actual auth server: the real `betterAuth()` engine (all plugins, D1/KV/R2), the admin dashboard, and only the admin/owner-facing pages (`/setup`, admin `/sign-in`, `/forgot-password`). See `infra/CLAUDE.md` for its full architecture.
- **`www/`** — the end-user "my account" app (like myaccount.google.com). Runs no auth server of its own — purely a consumer of `infra` via `better-auth/react`'s `createAuthClient` (`www/src/lib/auth-client.ts`), pointed at `infra`'s URL. This is also where `/sign-in`, `/create-account`, `/consent` (the OAuth provider's hosted pages) and payments UI are meant to live once built — currently a blank TanStack Start scaffold.
- **`plugins/`** — reserved for extracting `infra`'s custom better-auth plugins (`r2`, `infra-payment`, currently under `infra/src/auth/plugins/`) into standalone packages; nothing has been moved here yet.

`docs/` stays at the monorepo root, not inside `infra/` — GitHub Pages serves it as a repo-root `/docs` folder, so nesting it under `infra/` would break the deployed docs site.

Root-level `package.json`/`turbo.json` orchestrate both apps' own scripts (`dev`/`build`/`lint`/`typecheck`/`test`/`format`/`check`) via `turbo run <task>` — each app defines whichever of those it actually has. `.gitignore` and `.vscode/` live at root since they apply repo-wide, not just to `infra/`.
