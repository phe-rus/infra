# Scope: www

The public marketing site, serving the bare apex pherus.org. No auth or data layer by design, real content, and real i18n (en/zh/fr via Paraglide).

**Build approach:** Tracer Bullet (each new feature is built end to end through every layer until it works).
**Workflow:** Beta (after /develop: /check verify then /test; no fresh model review by default). A feature can carry its own tag, e.g. `· GA`, to run more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use /develop and skip /architect. You decide when a feature is done._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Landing page | Existing | existing |
| 2 | Showcase index and detail pages | Existing | existing |
| 3 | About us | Existing | existing |
| 4 | Legal pages | Existing | existing |
| 5 | License pages | Existing | existing |
| 6 | SEO infrastructure | Existing | existing |
| 7 | i18n (en/zh/fr) | Existing | existing |
| 8 | Navigation and toolbars | Existing | existing |
| 9 | Content JSON API endpoints | Existing | existing |
| 10 | SEO routes (robots.txt, sitemap.xml) | Existing | existing |
| 11 | Showcase body content | Existing | in-progress |
| 12 | Pherus license text | Existing | in-progress |
| 13 | Legal jurisdiction facts | Existing | in-progress |
| 14 | Blog | Slice 1 | planned |
| 15 | FAQ | Slice 1 | planned |
| 16 | Footers | Slice 1 | in-progress |
| 17 | i18n locale expansion, RTL | Slice 1 | in-progress |

## Existing

### 1. Landing page · existing
Hero with six field chips and curated showcase highlights across three tabs (Identity, Community, Research). code in `www/src/routes/(public)/index.tsx`

### 2. Showcase index and detail pages · existing
A masonry catalog of nine resources with stack/tags/catalogs/links, and dynamic per resource detail pages. code in `www/src/routes/(public)/showcase`

### 3. About us · existing
What we do, where we're based, and how we work, plus real contact info. code in `www/src/routes/(public)/about-us/index.tsx`

### 4. Legal pages · existing
An index plus privacy policy, terms of service, legal notice, and cookie policy, each with full Tiptap content per locale. code in `www/src/routes/(public)/legal`

### 5. License pages · existing
An index plus MIT, Apache 2.0, GPL 3.0 (verbatim text), and the Pherus license page. code in `www/src/routes/(public)/licenses`

### 6. SEO infrastructure · existing
OG/Twitter tags, canonical URLs, and a JSON-LD organization block, wired into every route's head. code in `www/lib/seo.ts`

### 7. i18n (en/zh/fr) · existing
Paraglide based routing, en unprefixed at /, zh and fr prefixed, with translated nav labels and page metadata. 

### 8. Navigation and toolbars · existing
A sticky header with logo, locale switcher, and a slide out nav drawer with motion based animation. code in `www/components/toolbars`

### 9. Content JSON API endpoints · existing
JSON endpoints for legal pages, licenses, and site storage info. code in `www/src/routes/api`

### 10. SEO routes (robots.txt, sitemap.xml) · existing
robots.txt allowlisting major crawlers including ClaudeBot and GPTBot, plus sitemap.xml. code in `www/src/routes/(seo)`

### 11. Showcase body content · in-progress
Pass has a full deep dive body; Health, Collective, Software, Research, Transspace, Futa, Laniina, and Sora show an honest placeholder instead. This is the deliberate current state, not a bug, per the standing rule to only write detailed content for real, auditable work.
**Done when:** a resource gets real content once there's something real to write about it; placeholders stay honest until then.
- [ ] Fill in as real facts arrive: `/develop showcase body content`
code in `www/data/showcase`

### 12. Pherus license text · in-progress
The Pherus license page shows a placeholder; the real terms haven't been drafted.
**Done when:** the real license text is in and renders verbatim.
- [ ] Fill in once drafted: `/develop pherus license text`
code in `www/data/licenses/pherus-license.json`

### 13. Legal jurisdiction facts · in-progress
Terms of Service and Legal Notice carry a bracketed jurisdiction placeholder in all three locales, waiting on the real governing law fact.
**Done when:** the real jurisdiction is filled in across all three locales.
- [ ] Fill in once known: `/develop legal jurisdiction facts`
code in `www/data/legal`

## Slice 1: Navigation and content gaps

### 14. Blog · needs a decision
A blog listing and post pages. Referenced as planned footer nav, but no routes, data, or i18n keys exist yet.
**Done when:** a visitor can browse a list of posts and read one, in all three locales, with SEO metadata.
- [ ] Design it (spec): `/architect blog`

### 15. FAQ · needs a decision
A FAQ page with question and answer entries. Referenced as planned footer nav, but not built.
**Done when:** a visitor can read a list of question and answer entries, in all three locales.
- [ ] Design it (spec): `/architect faq`

### 16. Footers · in-progress
A site footer with a Company group (About, Open Knowledge, Investors, Contact, Blog, FAQ) and a Legal group, following the same nav data pattern the header toolbar already uses.
**Done when:** every public page renders a footer with working links, in all three locales.
- [x] Build it: `/develop footers`
- [ ] Verify it: `/check verify footers`
- [ ] Test it: `/test footers`
code in `www/components/footers`

### 17. i18n locale expansion, RTL · in-progress
Grows i18n from three locales to eight (adding Swahili, Hindi, Arabic, German, Mexican Spanish), with full right to left layout support for Arabic and an honest, flagged unreviewed translation policy; legal and license pages stay English with a note until a reviewer signs off.
**Done when:** a visitor can browse the site fully translated in any of the 8 locales, Arabic mirrors the whole layout, every page in an unreviewed locale shows the machine drafted notice, and legal/license pages never show an unreviewed legal translation.
- [x] Design it (spec): [0001](../../specs/www/0001-i18n-locale-expansion-rtl/index.md)
- [ ] Build it: `/develop i18n locale expansion`
  - [x] Locale type safety fix (split `SiteLocale`/`ReviewedLocale`, `resolveContentLocale()`) before adding locales, satisfies the spec's key invariants
  - [ ] Add the 5 locale codes to Paraglide + write their UI chrome message files, satisfies AC-1, AC-3, AC-4
  - [ ] RTL layout mechanism end to end on the toolbar/footer/home slice (`dir` prop, logical CSS properties, nav drawer fix, directional icon audit), satisfies AC-2, AC-6
  - [ ] Sweep remaining pages onto the RTL convention, build the unreviewed banner and legal fallback note, satisfies AC-2, AC-3, AC-4
  - [ ] Confirm canonical/OG/JSON-LD URLs reflect the new locales, satisfies AC-5
- [ ] Verify it: `/check verify i18n locale expansion`
- [ ] Test it: `/test i18n locale expansion`
code in `www/data/lib/locale.ts`, `www/messages`, `shared/ui`

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Every other box is an execution box; `/architect` never ticks one.

- **Next step** = the first unticked box, always a command.
- **needs a decision** = run `/architect` first; otherwise straight to `/develop`.
- **Status**: `planned` → `in-progress` → `done`, plus `existing` (pre workflow, left alone by `/develop` and `/sync`) and `dropped` (kept for history).
- **Workflow tier tag** beside a heading overrides the project default for that one feature; no tag inherits Beta.

Heads up: root `CLAUDE.md` and `www/CLAUDE.md` describe Blog and FAQ as if already shipped, but no such routes or data exist in the actual code. Treat those docs as ahead of reality here; a `/sync` pass after this slice ships would be the place to fix that.
