import {
    getLocale,
    locales as paraglideLocales,
} from "@/paraglide/runtime"

export type SiteLocale = (typeof paraglideLocales)[number]

export const REVIEWED_LOCALES = [
    "en",
    "zh",
    "fr",
] as const satisfies readonly SiteLocale[]

export type ReviewedLocale = (typeof REVIEWED_LOCALES)[number]

const reviewedLocaleSet: ReadonlySet<SiteLocale> = new Set(
    REVIEWED_LOCALES
)

export const UNREVIEWED_LOCALES: readonly SiteLocale[] =
    paraglideLocales.filter(
        (locale) => !reviewedLocaleSet.has(locale)
    )

function isReviewedLocale(
    locale: SiteLocale
): locale is ReviewedLocale {
    return reviewedLocaleSet.has(locale)
}

/** Falls back to the English content locale for a site locale with no reviewed translation yet. */
export function resolveContentLocale(): {
    locale: ReviewedLocale
    isFallback: boolean
} {
    const locale = getLocale()
    return isReviewedLocale(locale)
        ? { locale, isFallback: false }
        : { locale: "en", isFallback: true }
}
