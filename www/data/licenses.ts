import { m } from "@/paraglide/messages"
import { z } from "zod"
import strings from "./licenses/strings.json"
import { defaultHandlers } from "./lib/handler"
import { resolveContentLocale } from "./lib/locale"
import { messageKey } from "./lib/message-key"
import type { BasiccnContent } from "@infra/rich-text"

const LicenseSchema = z.object({
    slug: z.enum([
        "pherus-license",
        "mit-license",
        "apache-2.0-license",
        "gpl-3.0-license",
    ]),
    path: z.enum([
        "/licenses/pherus-license",
        "/licenses/mit-license",
        "/licenses/apache-2.0-license",
        "/licenses/gpl-3.0-license",
    ]),
    labelKey: messageKey,
    spdxId: z.string().optional(),
    lastUpdated: z.string(),
    sourceUrl: z.string().optional(),
    keywords: z.array(z.string()),
})

const LicensesSchema = z.object({
    index: z.object({
        path: z.literal("/licenses"),
        titleKey: messageKey,
        keywords: z.array(z.string()),
    }),
    items: z.array(LicenseSchema),
})

export type License = z.infer<typeof LicenseSchema>
export type LicenseSlug = License["slug"]

export const licenses = defaultHandlers(LicensesSchema)({
    index: {
        path: "/licenses",
        titleKey: "nav.licenses.label",
        keywords: [
            "Pherus licenses",
            "Open source licenses",
            "MIT license",
            "Apache 2.0",
            "GPL 3.0",
            "Pherus License",
        ],
    },
    items: [
        {
            slug: "pherus-license",
            path: "/licenses/pherus-license",
            labelKey: "nav.licenses.pherus-license",
            lastUpdated: "2026-09-16",
            keywords: [
                "Pherus License",
                "Pherus Inc.",
                "Proprietary license",
            ],
        },
        {
            slug: "mit-license",
            path: "/licenses/mit-license",
            labelKey: "nav.licenses.mit-license",
            spdxId: "MIT",
            lastUpdated: "2026-09-16",
            sourceUrl: "https://opensource.org/license/mit",
            keywords: [
                "MIT license",
                "Open source",
                "Pherus open source code",
            ],
        },
        {
            slug: "apache-2.0-license",
            path: "/licenses/apache-2.0-license",
            labelKey: "nav.licenses.apache-2.0-license",
            spdxId: "Apache-2.0",
            lastUpdated: "2026-09-16",
            sourceUrl:
                "https://www.apache.org/licenses/LICENSE-2.0",
            keywords: [
                "Apache 2.0 license",
                "Open source",
                "Pherus open source code",
            ],
        },
        {
            slug: "gpl-3.0-license",
            path: "/licenses/gpl-3.0-license",
            labelKey: "nav.licenses.gpl-3.0-license",
            spdxId: "GPL-3.0-only",
            lastUpdated: "2026-09-16",
            sourceUrl:
                "https://www.gnu.org/licenses/gpl-3.0.html",
            keywords: [
                "GPL 3.0 license",
                "GPLv3",
                "Open source",
                "Pherus open source code",
            ],
        },
    ],
})

const docs = import.meta.glob<BasiccnContent>(
    "./licenses/*.json",
    {
        import: "default",
        eager: true,
    }
)

/** License text is shown in its original English only, never translated — only the surrounding page chrome (this disclaimer, descriptions) is localized. */
export function resolveLicense(slug: LicenseSlug) {
    const license = licenses.items.find(
        (entry) => entry.slug === slug
    )
    if (!license) return undefined

    const { locale, isFallback } = resolveContentLocale()
    const description =
        slug === "pherus-license"
            ? strings.pherusPlaceholder[locale]
            : strings.pageDescription[locale]

    return {
        slug: license.slug,
        path: license.path,
        label: m[license.labelKey](),
        spdxId: license.spdxId,
        lastUpdated: license.lastUpdated,
        sourceUrl: license.sourceUrl,
        description,
        disclaimer: strings.disclaimer[locale],
        content: docs[`./licenses/${slug}.json`],
        keywords: license.keywords,
        isFallback,
    }
}

export function resolveLicensesIndex() {
    const { locale } = resolveContentLocale()

    return {
        path: licenses.index.path,
        title: m[licenses.index.titleKey](),
        description: strings.index[locale],
        keywords: licenses.index.keywords,
        items: licenses.items.map((license) => ({
            slug: license.slug,
            path: license.path,
            label: m[license.labelKey](),
        })),
    }
}
