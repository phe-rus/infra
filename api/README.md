# api

The auth/payments/storage engine for pherus.org, deployed to Cloudflare Workers at `api.pherus.org`. Owns D1/KV/R2 and the real better-auth instance; `infra` and `www` are pure clients of it.

## First-run database migration

There's no in-app setup wizard — migrations are run manually via `POST /migrate`, guarded by `MIGRATION_SECRET` (see `.env.example`).

CSRF requires a trusted `Origin` header (any `localhost:*` origin in dev, or your production domain), otherwise the request never reaches the route. No trailing slash — `/migrate/` 404s, only `/migrate` matches.

```sh
curl -X POST http://localhost:3000/migrate \
  -H "x-migration-secret: $MIGRATION_SECRET" \
  -H "Origin: http://localhost:3000"
```

Run this once after first deploying (or after any schema change from a new plugin/field). Safe to call again — it's a no-op if there's nothing to migrate.
