<div align="center">
  <img src="./infra/public/favicon.svg" alt="Infra" width="135" height="135" style="border-radius: 50%;" />

  <h1 style="font-size: 32px; margin-top: 10px; margin-bottom: 5px; font-weight: bold;">Infra</h1>

  <p style="font-size: 1.2em; font-weight: 500; line-height: 1.6; margin-top: 5px; margin-bottom: 5px;">
    A centralized, self-hosted authentication server,<br />
    the one thing every app you build can point at.
  </p>

  <p style="line-height: 1.6; margin-top: 10px; margin-bottom: 10px;">
    Runs on your own Cloudflare account. No per-user bill, no third party holding your users' data.
  </p>

  <h2 style="margin-top: 50px; margin-bottom: 15px; font-weight: 500;">Technologies we use & love</h2>

  <!--
    Placing images sequentially inside a centered block container
    makes them behave like inline items. They automatically wrap
    cleanly to the next line on mobile screens with no borders.
  -->
  <p>
    <img src="https://tanstack.com/favicon.ico" alt="TanStack Start" width="30" height="30" style="border-radius: 50%; margin: 4px;" />
    <img src="https://www.cloudflare.com/favicon.ico" alt="Cloudflare" width="30" height="30" style="border-radius: 50%; margin: 4px;" />
    <img src="https://turbo.build/favicon.ico" alt="Turborepo" width="30" height="30" style="border-radius: 50%; margin: 4px;" />
    <img src="https://better-auth.com/branding/svg/better-auth-mark-light.svg" alt="Better Auth" width="30" height="30" style="border-radius: 50%; margin: 4px;" />
    <img src="https://bun.sh/favicon.ico" alt="Bun" width="30" height="30" style="border-radius: 50%; margin: 4px;" />
    <img src="https://tailwindcss.com/favicon.ico" alt="Tailwind CSS" width="30" height="30" style="border-radius: 50%; margin: 4px;" />
    <img src="https://biomejs.dev/img/favicon.svg" alt="Biome" width="30" height="30" style="border-radius: 50%; margin: 4px;" />
    <img src="https://ui.shadcn.com/favicon.ico" alt="shadcn/ui" width="30" height="30" style="border-radius: 50%; margin: 4px;" />
    <img src="https://zod.dev/logo/logo.svg" alt="Zod" width="30" height="30" style="border-radius: 50%; margin: 4px;" />
    <img src="https://www.anthropic.com/favicon.ico" alt="Claude Code" width="30" height="30" style="border-radius: 50%; margin: 4px;" />
    <img src="https://git-scm.com/favicon.ico" alt="Git" width="30" height="30" style="border-radius: 50%; margin: 4px;" />
  </p>
</div>

<br />

Infra is open source, published by Pherus. Pherus uses it, but Infra is not Pherus's product: it's its own project, and anyone can deploy their own instance

## What's in this repo

This is a Turborepo monorepo (bun workspaces):

| Package | What it is |
|---|---|
| [`infra/`](infra) | The auth engine. The real `betterAuth()` instance (all plugins, D1/KV/R2), the admin dashboard, and only the admin/owner-facing pages: `/setup`, admin `/sign-in`, `/forgot-password`. See [`infra/README.md`](infra/README.md). |
| `accounts/` | The end-user "my account" app, the same idea as myaccount.google.com. It runs no auth server of its own; it's a pure client of `infra` via `better-auth/react`'s `createAuthClient`. Hosts the OAuth provider's pages (`/sign-in`, `/create-account`, `/two-factor`, `/consent`, `/forgot-password`, `/reset-password`) plus profile and security (2FA, passkeys, active sessions). |
| `www/` | The public marketing site, a single placeholder page today. No auth or data layer by design. |
| `shared/ui` (`@infra/ui`) | The one UI kit, consumed by every app. No app owns its own copy of components. |
| `plugins/assets` (`@infra/assets`) | Object storage, extracted into a standalone package with server and client exports so other apps (or any third-party consumer) can call it too, not just `infra`'s own in-process `auth.api.*`. |

## Why three apps

Infra used to be a single app doing everything: the admin dashboard *and* the hosted OAuth login/consent/sign-up pages a connected app's users see. That coupled two very different audiences, the instance owner managing the platform and any end user of any connected app, into one surface.

Splitting them means `infra` only ever needs to authenticate its own admins/owners, and `accounts` is the one place an end user (of *any* app pointed at this instance) signs in and manages passkeys/2FA. The same shape as how Google separates the internal admin console from `myaccount.google.com`. `www` is separate again: the public-facing marketing site, with no auth or data layer at all.

## Running locally

```bash
bun install                                  # installs every workspace package
cp infra/.env.example infra/.env.local       # infra's secrets, see comments in the file
cp accounts/.env.example accounts/.env.local # accounts's config (points at infra's URL)
cp www/.env.example www/.env.local           # www's config (points at accounts's URL)
bun run dev                                  # starts infra (:3000), accounts (:3001), www (:3002)
```

Whenever you edit an `.env`/`.env.local` file, re-run `bun run type-gen` and fully restart the dev server. Vite's own file-watcher restart isn't enough for Cloudflare Worker bindings/secrets to pick up the change.

```bash
bun run build       # production build, every package
bun run typecheck   # tsc --noEmit, every package
```

See [`infra/CLAUDE.md`](infra/CLAUDE.md) and [`accounts/CLAUDE.md`](accounts/CLAUDE.md) for architecture and the OAuth provider.

## Deploying

`infra`, `accounts`, and `www` are each their own Cloudflare Worker, deployed independently:

```bash
bun run --cwd infra deploy
bun run --cwd accounts deploy
bun run --cwd www deploy
```

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, code conventions, and how to open a pull request. This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). Found a security issue? See [SECURITY.md](SECURITY.md), please don't open a public issue for it.

## License

[MIT](LICENSE)
