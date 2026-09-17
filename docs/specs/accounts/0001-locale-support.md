# 0001 · Locale support for accounts

**Status**: Assumed
**Date**: 2026-09-17
**Authorized by**: la niina, during /develop

## Owed decision
Whether accounts needs i18n at all, which locale set to support, the URL/routing strategy, whether accounts should share Paraglide/locale machinery with www or run its own independent setup, and which pages are in scope.

## Assumption built on
Mirror www's already working setup: accounts is the same TanStack Start / Cloudflare Workers stack in the same monorepo, sharing `@infra/ui`. Install `@inlang/paraglide-js`'s Vite plugin directly in accounts, with its own independent `project.inlang/settings.json` and generated `src/paraglide/` output, not shared code with www (each app owns its own compiled message output, matching how www's Paraglide setup is entirely self contained to www today, and how every other per app config in this monorepo already works). Same 3 reviewed locales www currently supports (en/zh/fr), same URL prefix routing convention (en unprefixed at `/`, zh at `/zh/`, fr at `/fr/`). A locale switcher component built the same way www's `components/toolbars/views/locale-switcher.tsx` is (`@infra/ui/components/select` driving Paraglide's `setLocale()`).

In scope: every accounts page, the OAuth hosted pages (`sign-in`, `create-account`, `two-factor`, `consent`, `forgot-password`, `reset-password`) and the end user account surfaces (`_workspace` `index`, `profile`, `security`'s 4 composed views), plus `components/headers.tsx` (the nav shell). infra stays out of scope entirely (settled by the engineer directly: admin only dashboard, no i18n).

No RTL scope: en/zh/fr contains no right to left language, so none of www's in progress RTL machinery (spec `www/0001-i18n-locale-expansion-rtl`) is needed here.

## Code area
`accounts/project.inlang/` (new), `accounts/vite.config.ts`, `accounts/src/paraglide/` (new, generated), `accounts/messages/{en,zh,fr}.json` (new), `accounts/src/routes/__root.tsx`, `accounts/components/headers.tsx`, `accounts/src/routes/_auth/*.tsx`, `accounts/src/routes/_workspace/*.tsx`, `accounts/src/routes/_protected/consent.tsx`, `accounts/domains/security/views/*.tsx`

## Requirements
A visitor can select en/zh/fr from a locale switcher on any accounts page; every route's UI chrome (nav, form labels, buttons, headings, body copy) renders in that language, at a URL prefix matching the pattern above. infra explicitly excluded from this feature.

## Ratify
This decision was recorded by /develop, not deliberated. Run `/architect locale for accounts`
to deliberate and ratify it. Until then it stays flagged as an owed decision; it does not block marking the feature `done`.
