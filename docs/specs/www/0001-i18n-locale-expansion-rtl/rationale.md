# 0001 · i18n locale expansion with RTL support · rationale

## Context

`www`'s i18n system (Paraglide, `en`/`zh`/`fr`) was built as a real, fully translated three locale setup: every route has a `head()`, every UI string goes through the compiled `m` proxy, and legal/license long form content lives as per language Tiptap JSON. The engineer wants to grow this to five more languages (Swahili, Hindi, Arabic, German, Mexican Spanish), aimed at reaching a wider, more global audience for a company site.

Two forces shape this decision more than the mechanics of adding locale files:

**Arabic is right to left, and nothing in this codebase handles that today.** `shared/ui` (`@infra/ui`), the one design system every app in this monorepo builds on, uses physical direction Tailwind utilities throughout (`ml-`, `pl-`, `left-`, `text-left`, and so on). A right to left language dropped into a left to right shaped layout does not read as "translated", it reads as broken: paragraphs align wrong, the nav order is backward, directional icons point the wrong way. Getting this right touches the shared design system, not just `www`, because the same components are consumed by `infra` and `accounts` too.

**Publishing machine translated legal text is a real liability question, not just a content one.** The privacy policy, terms of service, and legal notice are documents with actual legal weight (see `docs/specs/infra` and this app's own `data/legal/` convention of never fabricating a legal fact). Neither the engineer nor the AI is a certified translator or lawyer fluent in five additional languages. Shipping an AI drafted legal document as if it were the real, reviewed policy in that language is worse than not offering that language yet, because a visitor reading it in good faith has no way to know it might be wrong.

The engineer resolved both forces directly during design: Arabic gets full RTL layout mirroring, not a text only treatment, and every string (UI chrome and long form legal content) will be AI drafted, clearly flagged as unreviewed, EXCEPT that legal and license pages specifically fall back to the English original (with a note) until a native and legal reviewer signs off, rather than ever showing an unreviewed legal document as if it were final.

## Options considered

### Option 1: Text only translation, keep the LTR layout for Arabic

Translate every string into Arabic but leave the page's visual structure (nav order, icon direction, text alignment) exactly as it is for English.

**Pros**:
- No changes needed to `shared/ui`'s design tokens or component classes.
- Fastest to ship.

**Cons**:
- Reads as broken to an Arabic speaking visitor: paragraphs render right to left inside a left aligned container, the nav and footer read in the wrong order, back/forward icons point the wrong way. This actively undermines the "professional company site" goal the engineer stated for `www` overall.
- Not chosen; the engineer explicitly asked for full RTL.

### Option 2: Full RTL layout via logical CSS properties (chosen)

Add a `dir` attribute to `<html>` driven by the active locale, and migrate `shared/ui`'s components and `www`'s own layout classes from physical direction utilities (`ml-`, `text-left`) to Tailwind's logical direction equivalents (`ms-`, `text-start`), which automatically mirror under `dir="rtl"`.

**Pros**:
- The whole page genuinely mirrors: reads as a real, professional Arabic experience, not English-with-Arabic-words.
- Logical properties are the standard, low maintenance way to do this in Tailwind v4 (no separate RTL stylesheet or `:dir()` overrides to hand maintain).
- Lives in `shared/ui`, so `infra`/`accounts` benefit automatically if they ever need RTL, without extra work.

**Cons**:
- A real sweep across `shared/ui`'s components and `www`'s own route/component classes; not a small diff.
- Directional icons (chevrons, back arrows) still need individual attention; logical properties alone do not flip an SVG.

### Option 3: A separate RTL stylesheet override

Keep physical utilities everywhere, and add a `[dir="rtl"]` scoped override stylesheet that manually flips the properties that matter.

**Pros**:
- Does not require touching every component's className list.

**Cons**:
- A second, hand maintained source of truth that silently drifts from the real component classes as they change; the exact "second stylesheet fighting the first" pattern `www/AGENTS.md` already rejected once for typography (`typeset.css` vs per page `[&_h2]` overrides). Not chosen, for the same reason.

## Rationale

Option 2 was chosen because it is the only one that actually delivers what the engineer asked for (full mirroring, not text only), and because it is the version of "RTL support" that keeps working without hand maintenance as the design system evolves, the same reasoning this codebase already applied when it centralized typography in `typeset.css` instead of per page overrides. Doing this in `shared/ui` rather than only in `www` is deliberate: the cost (auditing existing components) is paid once, in the one place every app already imports from, rather than `www` maintaining its own parallel RTL layer on top of a design system that doesn't know about direction at all.

The unreviewed translation policy (AI drafts everything, but legal/license pages fall back to English with a note rather than ever showing unreviewed legal text) mirrors this codebase's own established discipline: `feedback_legal_content_placeholders` (never fabricate a legal or business fact, bracket what is not real) and the showcase page convention of an honest placeholder over an invented one. An AI drafted legal document a visitor cannot tell is unreviewed is a worse failure mode than an honest "not yet available" note.
