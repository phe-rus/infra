import { m } from "@/paraglide/messages"
import { z } from "zod"
import cookiePolicyContent from "./legal/site-storage.json"
import legalIndexContent from "./legal/index.json"
import legalNoticeContent from "./legal/legal-notice.json"
import privacyPolicyContent from "./legal/privacy-policy.json"
import termsOfServiceContent from "./legal/terms-of-service.json"
import { defaultHandlers } from "./lib/handler"
import { resolveContentLocale } from "./lib/locale"
import { messageKey } from "./lib/message-key"
import type { TiptapDoc } from "./lib/tiptap-doc"

const tiptapDoc = z.custom<TiptapDoc>(
    (value) => typeof value === "object" && value !== null
)

const LocalizedString = z.object({
    en: z.string(),
    zh: z.string(),
    fr: z.string(),
})

const LocalizedDoc = z.object({
    en: tiptapDoc,
    zh: tiptapDoc,
    fr: tiptapDoc,
})

const CookieEntrySchema = z.object({
    name: z.string(),
    purpose: z.string(),
    duration: z.string(),
})

const LocalizedCookies = z.object({
    en: z.array(CookieEntrySchema),
    zh: z.array(CookieEntrySchema),
    fr: z.array(CookieEntrySchema),
})

const LegalPageSchema = z.object({
    slug: z.enum([
        "privacy-policy",
        "terms-of-service",
        "legal-notice",
    ]),
    path: z.enum([
        "/legal/privacy-policy",
        "/legal/terms-of-service",
        "/legal/legal-notice",
    ]),
    titleKey: messageKey,
    description: LocalizedString,
    content: LocalizedDoc,
})

const CookiePolicySchema = z.object({
    slug: z.literal("cookie-policy"),
    path: z.literal("/legal/cookie-policy"),
    titleKey: messageKey,
    description: LocalizedString,
    intro: LocalizedDoc,
    sections: LocalizedDoc,
    cookies: LocalizedCookies,
    durationLabel: LocalizedString,
})

const LegalSchema = z.object({
    index: z.object({
        path: z.literal("/legal"),
        titleKey: messageKey,
        description: LocalizedString,
    }),
    pages: z.array(LegalPageSchema),
    cookiePolicy: CookiePolicySchema,
})

export type LegalPage = z.infer<typeof LegalPageSchema>
export type LegalSlug =
    | LegalPage["slug"]
    | z.infer<typeof CookiePolicySchema>["slug"]

export const legal = defaultHandlers(LegalSchema)({
    index: {
        path: "/legal",
        titleKey: "nav.legal.label",
        description: legalIndexContent.description,
    },
    pages: [
        {
            slug: "terms-of-service",
            path: "/legal/terms-of-service",
            titleKey: "nav.legal.terms-of-service",
            description: termsOfServiceContent.description,
            content: termsOfServiceContent.content,
        },
        {
            slug: "privacy-policy",
            path: "/legal/privacy-policy",
            titleKey: "nav.legal.privacy-policy",
            description: privacyPolicyContent.description,
            content: privacyPolicyContent.content,
        },
        {
            slug: "legal-notice",
            path: "/legal/legal-notice",
            titleKey: "nav.legal.legal-notice",
            description: legalNoticeContent.description,
            content: legalNoticeContent.content,
        },
    ],
    cookiePolicy: {
        slug: "cookie-policy",
        path: "/legal/cookie-policy",
        titleKey: "nav.legal.cookie-policy",
        description: cookiePolicyContent.description,
        intro: cookiePolicyContent.intro,
        sections: cookiePolicyContent.sections,
        cookies: cookiePolicyContent.cookies,
        durationLabel: cookiePolicyContent.durationLabel,
    },
})

export function resolveLegalPage(slug: LegalPage["slug"]) {
    const page = legal.pages.find(
        (entry) => entry.slug === slug
    )
    if (!page) return undefined

    const { locale, isFallback } = resolveContentLocale()

    return {
        slug: page.slug,
        path: page.path,
        title: m[page.titleKey](),
        description: page.description[locale],
        content: page.content[locale],
        isFallback,
    }
}

export function resolveCookiePolicy() {
    const { cookiePolicy } = legal
    const { locale, isFallback } = resolveContentLocale()

    return {
        slug: cookiePolicy.slug,
        path: cookiePolicy.path,
        title: m[cookiePolicy.titleKey](),
        description: cookiePolicy.description[locale],
        intro: cookiePolicy.intro[locale],
        sections: cookiePolicy.sections[locale],
        cookies: cookiePolicy.cookies[locale],
        durationLabel: cookiePolicy.durationLabel[locale],
        isFallback,
    }
}

export function resolveLegalIndex() {
    const { locale } = resolveContentLocale()

    const bySlug = (slug: LegalSlug) => {
        if (slug === "cookie-policy") {
            return {
                slug,
                path: legal.cookiePolicy.path,
                label: m[legal.cookiePolicy.titleKey](),
            }
        }

        const page = legal.pages.find(
            (entry) => entry.slug === slug
        )
        if (!page) return undefined

        return {
            slug,
            path: page.path,
            label: m[page.titleKey](),
        }
    }

    return {
        path: legal.index.path,
        title: m[legal.index.titleKey](),
        description: legal.index.description[locale],
        items: (
            [
                "terms-of-service",
                "privacy-policy",
                "cookie-policy",
                "legal-notice",
            ] satisfies LegalSlug[]
        )
            .map(bySlug)
            .filter(
                (item): item is NonNullable<typeof item> =>
                    Boolean(item)
            ),
    }
}
