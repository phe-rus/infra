# 0001. Expand www i18n to five more locales, with full RTL for Arabic

**Date**: 2026-09-17
**Status**: In Progress

## Summary

This decision grows `www`'s language support from three locales (English, Chinese, French) to eight, adding Swahili, Hindi, Arabic, German, and Mexican Spanish. Arabic reads right to left, so the page layout itself mirrors (not just the text), which means the shared design system (`@infra/ui`) gains real right to left support, not just `www`. Every new string is drafted by the AI and clearly flagged as not yet reviewed by a native speaker, except legal and license pages, which keep showing the English original with a note until a real reviewer signs off, so this company site never presents an unverified legal document as if it were final.

## Context

See `rationale.md`.

## Requirements

**User stories**:
- As a visitor whose first language is Swahili, Hindi, Arabic, German, or Mexican Spanish, I want to browse the site in my language so I can understand what Pherus does without relying on English.
- As an Arabic speaking visitor, I want the page to read right to left the way a real Arabic website does, not English text swapped for Arabic words inside a left to right layout.
- As any visitor reading a page in one of the five new languages, I want to know clearly that the translation is AI drafted and not yet reviewed, so I know to double check anything that matters.
- As a visitor reading a legal page (privacy policy, terms, license), I want to see the real, reviewed text, even if that means seeing it in English while my language isn't reviewed yet, rather than an unverified legal translation I can't tell is unverified.

**Acceptance criteria**:
- **AC-1**: A visitor can select Swahili, Hindi, Arabic, German, or Mexican Spanish from the locale switcher; every route's UI chrome (nav, footer, page headings and body copy, buttons) renders in that language, at a URL prefix matching the existing pattern (`/sw/`, `/hi/`, `/ar/`, `/de/`, `/es-mx/`).
- **AC-2**: With Arabic active, the whole page mirrors: `<html dir="rtl">` is set, and nav/footer link order, icon direction, text alignment, and spacing all flip through logical CSS properties, not just the text becoming right to left inside an unmirrored layout.
- **AC-3**: Every page rendered in one of the five new locales shows a persistent, visible banner stating the translation is machine drafted and not yet reviewed. English, Chinese, and French show no such banner (they are real, human reviewed content).
- **AC-4**: Legal and license pages (privacy policy, terms of service, legal notice, cookie policy, and the four license pages) render the English content with a visible "not yet available in this language" note when viewed in one of the five new locales, never an unreviewed legal translation.
- **AC-5**: Canonical/OG/JSON-LD URLs (`lib/seo.ts`, which already runs every URL through `localizeUrl()`) correctly reflect the five new locale prefixes without a second, hand maintained list of locales. (Note: `sitemap.xml` does not currently emit per locale URL variants for any locale, including the existing `zh`/`fr`; that is a pre-existing gap, tracked separately in Follow-up, not part of this criterion.)
- **AC-6**: Any left/right directional icon (a chevron or arrow that points into the reading direction) visually flips under `dir="rtl"`; a non-directional icon (the logo, mail, an up/down chevron) does not. As of this spec, `www` uses no left/right directional icons at all (confirmed by search), so this criterion currently has nothing to flip; it exists so the very next directional icon added doesn't get missed.

## Options considered

See `rationale.md`.

## Decision

**Chosen option**: Option 2: Full RTL layout via logical CSS properties.

Add the five locales to Paraglide, give `shared/ui` and `www` a real `dir` aware layout by migrating physical direction Tailwind utilities to their logical equivalents, and draft every string as AI translated and flagged, except legal/license content, which stays English with a note until reviewed.

## Rationale

See `rationale.md`.

## Feature design

**Data model sketch**:
No database entity changes; `www` has no persistence layer. The real design work here is two small type/config additions, corrected after a cross check caught a real gap in the first draft:
- **The existing `Locale` type in `data/lib/locale.ts` is hardcoded to `"en" | "zh" | "fr"`, and every legal/license resolver (`resolveLegalPage`, `resolveCookiePolicy`, `resolveLegalIndex`, the licenses equivalents) indexes straight into a `{en, zh, fr}` object with no presence check** (`activeLocale()` does an unchecked `getLocale() as Locale` cast). Growing Paraglide's locale list to 8 without touching this would make `page.content["sw"]` silently `undefined` at runtime while TypeScript stays green. Fix: split into two types. `SiteLocale` = all 8 codes (drives routing, the locale switcher, message files). `Locale` (renamed `ReviewedLocale` for clarity) stays the 3 content locales that actually have legal/license translations. A new `resolveContentLocale(): { locale: Locale; isFallback: boolean }` helper (in `data/lib/locale.ts`) replaces every raw `activeLocale()` indexing call in `legal.ts`/`licenses.ts`: it returns the current locale if it's one of the 3 reviewed ones, else `{ locale: "en", isFallback: true }`.
- `REVIEWED_LOCALES`: the fixed 3 codes (`en`, `zh`, `fr`) that have real, human reviewed content. `UNREVIEWED_LOCALES` is **derived**, not a second hand maintained list: `paraglideLocales.filter(l => !REVIEWED_LOCALES.includes(l))`, so a future locale addition can't add itself to Paraglide and be forgotten by the banner gate.
- Paraglide's own locale list (`project.inlang/settings.json`'s `locales` array) grows from 3 to 8 entries; this is config, not a data model. (There is no `urlPatterns` block in this app's `vite.config.ts` to edit, Paraglide's default URL strategy already derives the prefix from the locale list.)

**State transitions**: None; a locale is chosen per request/navigation, not a stored state.

**API surface**: None; `www` has no backend. All of this is static routing, config, and content.

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Render `<html>` | `lang` attribute | `getLocale()`, already wired (existing pattern) |
| Render `<html>` | `dir` attribute (`ltr`/`rtl`) | Derived: `getLocale() === "ar" ? "rtl" : "ltr"`, computed in `__root.tsx`, same place `lang` is computed |
| Render any page | Whether to show the unreviewed translation banner | `UNREVIEWED_LOCALES.includes(getLocale())`, a new static constant (not user or server configurable) |
| Render a legal/license page | Which document body to show (translated vs. English fallback) | `resolveContentLocale()` (`data/lib/locale.ts`, new), used by every legal/license resolver instead of raw indexing |
| Render a legal/license page | Whether to show the "not yet available" note | Same helper's `isFallback` field |
| Render nav/footer/page copy | The translated string itself | `www/messages/{sw,hi,ar,de,es-mx}.json`, new files, one key per existing `en.json` key |
| Render the unreviewed banner / fallback note | Their copy | Ordinary translated UI chrome keys (`unreviewedBanner.*`, `legalFallbackNote.*`) added to all 8 message files like any other nav/footer string, not a one off hardcoded string |
| Locale switcher options | The list of selectable languages, native names | Paraglide's `locales` export, extended by the Paraglide config change; native names via `Intl.DisplayNames` (`getNativeLanguageName`, `www/lib/intl.displayNames.ts`) |
| Locale switcher native name for Mexican Spanish | The display string for `es-mx` | `Intl.DisplayNames` needs a canonical-cased region subtag; `getNativeLanguageName` special cases `es-mx` to look up as `"es-MX"` while the URL/Paraglide code stays lowercase `es-mx`, since the lowercase form is not guaranteed to canonicalize the same way across JS engines |
| Canonical/OG/JSON-LD URLs | Per locale URL | `localizeUrl()` (`lib/seo.ts`), already locale agnostic; no second list to maintain |

**Key invariants**:
- A legal or license page never renders an untranslated-but-unflagged document: `resolveContentLocale()`'s `isFallback` and the English fallback content are mandatory together, never the fallback silently alone.
- The unreviewed banner and the legal/license fallback note are two different, independently triggered pieces of UI; a locale can trigger one, both, or (for `en`/`zh`/`fr`) neither.
- `UNREVIEWED_LOCALES` is always derived from Paraglide's locale list minus `REVIEWED_LOCALES`, never a separately maintained array, so it can't drift out of sync with the locale list.
- `shared/ui` components migrated to logical properties must not regress the existing LTR (`en`/`zh`/`fr`) layout; logical properties render identically to their physical equivalents under `dir="ltr"` by design, so this should be a non visual change for existing locales, verify it is.
- A horizontally scrolling element (the `typeset-scroll` table wrapper used by legal pages with tables, now rendered via `@infra/rich-text`'s table support) must still scroll and read correctly under `dir="rtl"`; browsers can flip which edge a table's overflow starts from and how `scrollLeft` behaves, so this needs an explicit check, not an assumption that the logical property sweep alone covers it.
- The nav drawer's open/close animation (`views/nav-drawer.tsx`, Motion's `AnimatePresence`) slides via an imperative `translateX` distance, which is not a CSS class the logical property sweep touches; it needs its own explicit fix (the slide direction and any distance values) to actually mirror under `dir="rtl"`.

**Security model**: N/A, public marketing content, no auth, no user data involved.

**Configuration required**: None (no new env vars or credentials; Paraglide config is committed source, not a secret).

**Critical test scenarios**:
- Happy path: switch to Arabic, confirm the toolbar, footer, and home page fully mirror (nav order, icon direction, text alignment) and every string is Arabic, verifies **AC-1**, **AC-2**, **AC-6**.
- Happy path: switch to German, confirm every page renders translated UI chrome with the unreviewed banner visible, verifies **AC-1**, **AC-3**.
- Fallback case: visit `/hi/legal/privacy-policy`, confirm it renders the English document body with a visible "not yet available in Hindi" note, not a Hindi translation, verifies **AC-4**.
- Regression case: visit `/` (English) and `/zh/` after the logical property migration, confirm the layout is pixel equivalent to before (no unintended shift from the physical to logical property swap), verifies the key invariant above.
- RTL interaction case: open the nav drawer and view a legal page containing a table (e.g. legal notice) with Arabic active, confirm the drawer slides from the correct edge and the table scrolls and reads correctly, verifies the drawer and `typeset-scroll` key invariants above.
- SEO case: fetch `/robots.txt` and inspect `lib/seo.ts`'s canonical URL output for a new locale, confirm neither needed a hardcoded locale list update, verifies **AC-5**.

## Build plan

Ordered per this project's Tracer Bullet approach: prove the RTL mechanism end to end on one thin real slice (nav shell plus one full content page) before sweeping the rest of the site, and let translation content work proceed independently since it does not depend on the RTL mechanism.

1. Fix the locale type gap first, before adding locales makes it dangerous: split `data/lib/locale.ts`'s `Locale` into `SiteLocale` (all locales) and `ReviewedLocale` (the 3 with real content), add `resolveContentLocale()`, and switch `legal.ts`/`licenses.ts`'s resolvers to use it instead of raw indexing. Add `REVIEWED_LOCALES`/derived `UNREVIEWED_LOCALES`. Satisfies the key invariants above; nothing yet depends on 8 locales existing, so this is safe to land and verify against the current 3.
2. Add the five locale codes to Paraglide (`project.inlang/settings.json`'s `locales` array; there is no `urlPatterns` block to edit, the default URL strategy derives the prefix from the locale list), regenerate `src/paraglide/`. Special case `es-mx` in `getNativeLanguageName` (`www/lib/intl.displayNames.ts`) to look up its native name as `"es-MX"`. Satisfies **AC-1**.
3. Write `www/messages/{sw,hi,ar,de,es-mx}.json`: full key for key translation of `en.json`'s UI chrome (nav, footer, overview, about, showcase labels), including new `unreviewedBanner.*`/`legalFallbackNote.*` keys, explicitly excluding legal/license bodies. Mark each file as AI drafted for a future reviewer. Satisfies **AC-1**, **AC-3**, **AC-4**.
4. Add `dir` support end to end for the thinnest full slice (toolbar, footer, home page): extend `ComposeViewport.Window` (`shared/ui`) with an additive `dir?: "ltr" | "rtl"` prop defaulting to `"ltr"` (same non breaking shape as the existing `lang` prop, so `infra`/`accounts` are unaffected), wire `www/src/routes/__root.tsx` to compute and pass it. Migrate the toolbar's, footer's, and home page's physical direction Tailwind classes to logical equivalents. Satisfies **AC-2**.
5. Fix the nav drawer's imperative Motion `translateX` slide to respect `dir` (it will not follow from the CSS sweep alone). Satisfies **AC-2**.
6. Audit `www` for left/right directional icons before assuming there's nothing to flip (a new one may have been added since this spec was written); as of writing there are none. Apply a `rtl:` Tailwind variant to any found; leave non-directional icons (logo, mail, up/down chevrons) untouched. Satisfies **AC-6**.
7. Manually verify the slice: visit `/ar/`, confirm the toolbar, footer, home page, and nav drawer mirror correctly and read naturally.
8. Sweep the remaining `www` pages (`/showcase`, `/showcase/$slug`, `/about-us`, `/legal` and `/licenses` index and detail pages) onto the same logical property convention, including the `typeset-scroll` table wrapper used by legal pages with tables. Satisfies **AC-2**.
9. Build the unreviewed translation banner (one small component, mounted once in `(public)/route.tsx` below the toolbar so it appears on every page for an unreviewed locale, using `UNREVIEWED_LOCALES` from step 1). Satisfies **AC-3**.
10. Wire the "not yet available in this language" note as one small shared component (using `resolveContentLocale()`'s `isFallback` from step 1), reused across the 8 legal/license route files rather than repeated per file. Satisfies **AC-4**.
11. Confirm (not assume) `lib/seo.ts`'s canonical URL output correctly reflects the new locales once step 2 lands, since it already runs through `localizeUrl()` generically. Satisfies **AC-5**.

## Consequences

**Positive**:
- Real reach into five more language communities, doubling plus the site's addressable audience.
- The RTL groundwork lives in `shared/ui`, so any future app on this design system (or a future RTL language) inherits it for free.
- Establishes a reusable, honest "unreviewed translation" pattern the project can lean on for any future locale addition, not just these five.

**Negative / tradeoffs**:
- Ongoing translation maintenance cost roughly triples (8 locales' worth of message files to keep in sync on every future copy change, versus 3 today).
- The logical property sweep across `shared/ui` is a real one time cost, and first pass RTL bugs on individual components are likely; needs visual verification per component, not just a mechanical find and replace.
- Legal/license pages will show a mixed language experience (English legal text inside an otherwise fully translated Arabic/Hindi/Swahili/German/Mexican Spanish page) until a real reviewer signs off; intentionally honest, not fully polished.

**Neutral**:
- `shared/ui`'s own styling convention permanently shifts toward logical over physical direction utilities going forward; worth capturing in `shared/ui`'s `AGENTS.md` once this ships (see Follow-up; `/sync` owns that update, not this spec).

## Follow-up

- [ ] Once shipped, add a "logical CSS properties over physical" convention note to `shared/ui`'s `AGENTS.md`.
- [ ] `robots.txt`/`sitemap.xml` currently only enumerate the canonical (English) route paths; `zh`/`fr` have never appeared in the sitemap either, since the underlying route tree isn't locale prefixed. This predates this spec and isn't introduced by it, but is worth its own follow up once full multilingual SEO coverage matters.
- [ ] A native speaker and, separately, a legal reviewer are needed before legal/license pages can go live in `sw`/`hi`/`ar`/`de`/`es-mx`. Once available, add those locale keys to `data/legal/*.json` and `data/licenses/*.json`; the English fallback stops applying automatically once the key exists.
- [ ] `es-mx` is Mexican Spanish specifically (per the engineer's own request), not generic Spanish; if a future request asks for Spanish more broadly (e.g. Spain), treat that as a distinct locale (`es` or `es-ES`), not a rename of this one.
