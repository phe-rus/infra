# Scope: infra monorepo

A map of the whole monorepo's scope, one line per workspace plus repo wide shared infra. Each links its own scope file.

**Build approach (project default):** Tracer Bullet, each new feature built end to end through every layer until it works. Chosen because every workspace here is a mature, already shipping system; new work adds real, permanent capability rather than validating an unproven idea.
**Workflow (project default):** Beta, `/check verify` then `/test` after `/develop`, no fresh model review by default. Chosen for a real production auth platform with real users; any feature that touches credentials or security surfaces directly can be tagged `· GA` for the extra review pass.

| Workspace | Rollup | Scope |
|---|---|---|
| infra | 8 existing, 2 in progress, 1 planned | [infra/scope.md](infra/scope.md) |
| accounts | 10 existing, 0 in progress, 0 planned | [accounts/scope.md](accounts/scope.md) |
| www | 10 existing, 3 in progress, 3 planned | [www/scope.md](www/scope.md) |
| _root (shared packages, tooling) | 4 existing, 1 in progress, 1 planned | [_root/scope.md](_root/scope.md) |

## Notes from this pass

- No root `AGENTS.md` exists yet, only `CLAUDE.md` files (root, `infra`, `accounts`, `www`). This pass read those plus a live code scan of each workspace instead. Consider running `/audit` to bootstrap real `AGENTS.md` files; later skills (`/architect`, `/develop`, `/sync`) read that file, not `CLAUDE.md`, for conventions.
- Root `CLAUDE.md` and `www/CLAUDE.md` describe `/blog` and `/faq` as already shipped; the actual code has neither. Enrolled as `planned`, not `existing`, since brownfield enrollment goes by what the code shows. Worth a `/sync` pass once those ship, to fix the stale docs.
- The push notifications plugin (`@infra/icm`) and infra's admin surface for it are split across two files on purpose: the plugin itself is repo wide infra (`_root/scope.md`), the admin UI that consumes it is infra specific (`infra/scope.md`). Build the plugin first; the admin surface depends on it.
