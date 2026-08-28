# Contributing to Infra

Thanks for taking the time to contribute. This document covers how to set up the project, the conventions the codebase follows, and how to get a change merged.

## Before you start

- For a bug fix or a small, well-scoped change, just open a pull request.
- For anything larger (a new feature, a behavior change, a new dependency), open an issue first to discuss the approach before writing code. It saves rework on both sides.
- Read [`CLAUDE.md`](CLAUDE.md) and [`infra/CLAUDE.md`](infra/CLAUDE.md) before touching architecture. They're the source of truth for how this repo is organized and why, kept up to date as the codebase changes, and cover far more detail than fits here.

## Project setup

```bash
bun install                                  # installs every workspace package
cp infra/.env.example infra/.env.local       # infra's secrets, see comments in the file
cp accounts/.env.example accounts/.env.local # accounts's config (points at infra's URL)
cp www/.env.example www/.env.local           # www's config (points at accounts's URL)
bun run dev                                  # starts infra (:3000), accounts (:3001), www (:3002)
```

Whenever you edit an `.env`/`.env.local` file, re-run `bun run type-gen` and fully restart the dev server. Vite's own file-watcher restart isn't enough for Cloudflare Worker bindings/secrets to pick up the change.

Prerequisites: a Cloudflare account and a [Resend](https://resend.com) API key (for transactional email). See `infra/.env.example` for the full list of values you need to fill in.

## Workflow

```bash
bun run dev         # local dev, every app
bun run build        # production build, every package
bun run typecheck    # tsc --noEmit, every package
bun run test          # vitest, every package that has tests
bun run lint          # biome lint, whole repo
bun run format        # biome format --write, whole repo
bun run check          # biome format (no writes), whole repo
```

Run `bun run format` and `bun run typecheck` before opening a pull request. CI checks both.

## Code conventions

- **One root-level Biome config** (`biome.json`) handles linting and formatting for the whole monorepo. No semicolons, double quotes, 4-space indent, 100-character line width. Don't hand-format against these; run `bun run format`.
- **Imports are not auto-sorted.** `assist.actions.source.organizeImports` is deliberately off; don't reorder imports as a side effect of an unrelated change.
- **`shared/ui/src/components/**` is shadcn-generated and never hand-edited.** Add or update a primitive with `bunx shadcn add <component>` from inside `shared/ui/`, not by writing the file directly.
- **Minimal comments.** Code should read clearly from naming and structure; a comment is for a non-obvious constraint or a workaround, not a restatement of what the code does.
- **No new abstractions for a single call site.** Three similar lines are better than a premature helper. If something is genuinely reused by more than one place, it likely belongs in `@infra/ui`'s `widgets/`, not duplicated locally.
- Match the shape of existing code in the same directory before introducing a new pattern. `infra/CLAUDE.md` documents the conventions in detail (route structure, the `kit/<domain>/` layer, mutation hooks, and more); when a file's existing shape and this document seem to disagree, the code plus `CLAUDE.md` win.

## Commit messages

This repo uses [Conventional Commits](https://www.conventionalcommits.org/): a lowercase type prefix, a colon, and a concise summary of the change.

```
feat: add passkey support to the sign-in flow
fix: correct session redirect after impersonation ends
refactor: consolidate the console's create/edit forms into one component
chore: bump turbo to v2.10.11
docs: fix broken link in infra/CLAUDE.md
```

Keep the summary in the imperative mood ("add", not "added" or "adds"), and keep it to one line unless the change genuinely needs more explanation in the body.

## Pull requests

- Keep a pull request focused on one change. A bug fix and an unrelated refactor are two pull requests, not one.
- Describe what changed and why, not just what. If the change fixes a bug, describe the failure case.
- Update `CLAUDE.md`/`infra/CLAUDE.md`/`accounts/CLAUDE.md` in the same pull request if your change alters something they document (a route's behavior, a new plugin, a changed convention). Stale architecture docs are worse than none.
- Add or update tests where it makes sense. There's no enforced coverage threshold, but a bug fix without a regression test is easy to reintroduce.

## Reporting a bug

Open an issue with:

- What you expected to happen, and what happened instead
- Steps to reproduce, ideally minimal
- Whether it's local dev only, a deployed instance, or both
- Relevant logs or error output

## Reporting a security issue

Don't open a public issue for a security vulnerability. See [SECURITY.md](SECURITY.md) for the private reporting channel.

## Code of conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you're expected to uphold it.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
