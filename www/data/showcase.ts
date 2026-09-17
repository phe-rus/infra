import { z } from "zod"
import { defaultHandlers } from "./lib/handler"
import { messageKey } from "./lib/message-key"
import type { BasiccnContent } from "@infra/rich-text"

const ResourceLinkSchema = z.object({
    label: z.string(),
    href: z.string(),
})

const HomeCategorySchema = z.enum([
    "identity",
    "community",
    "research",
])

export type HomeCategory = z.infer<typeof HomeCategorySchema>

const ResourceSchema = z.object({
    slug: z.string(),
    title: z.string(),
    img: z.string(),
    /** RSS feed path, only set for resources with a public feed (drives the landing page marquee). */
    feed: z.string().optional(),
    descriptionKey: messageKey.optional(),
    keywords: z.array(z.string()),
    tags: z.array(z.string()).optional(),
    stack: z.array(z.string()).optional(),
    catalogs: z.array(z.string()).optional(),
    /** Only set once a resource is actually shipped and live, not just announced. */
    status: z.enum(["active", "in-development"]).optional(),
    links: z.array(ResourceLinkSchema).optional(),
    /** Only set for the specific resources highlighted on the home page's tabs. */
    homeCategory: HomeCategorySchema.optional(),
})

const ShowcaseSchema = z.object({
    index: z.object({
        path: z.literal("/showcase"),
        titleKey: messageKey,
        descriptionKey: messageKey,
        keywords: z.array(z.string()),
    }),
    items: z.array(ResourceSchema),
})

export type Resource = z.infer<typeof ResourceSchema>

export const showcase = defaultHandlers(ShowcaseSchema)({
    index: {
        path: "/showcase",
        titleKey: "nav.showcase",
        descriptionKey: "showcase.hero.description",
        keywords: [
            "Pherus showcase",
            "Identity and access management",
            "Health technology",
            "Legal technology",
            "Open source projects",
        ],
    },
    items: [
        {
            slug: "pass",
            title: "Pass",
            img: "/showcase/pass.svg",
            feed: "/rss/pass",
            descriptionKey: "showcase.pass.description",
            keywords: [
                "Pherus Pass",
                "Identity platform",
                "OAuth 2.1",
                "OIDC",
                "Self-hosted authentication",
                "Open source identity",
            ],
            tags: [
                "Identity",
                "OAuth 2.1 & OIDC",
                "Self-hosted",
            ],
            stack: [
                "bun",
                "React",
                "TanStack Start",
                "Tailwind CSS",
                "TypeScript",
                "Cloudflare Workers",
            ],
            catalogs: ["Infra", "Accounts"],
            status: "active",
            links: [
                {
                    label: "Infra (auth server)",
                    href: "https://infra.pherus.org",
                },
                {
                    label: "Accounts",
                    href: "https://account.pherus.org",
                },
            ],
            homeCategory: "identity",
        },
        {
            slug: "health",
            title: "Health",
            img: "/showcase/health.svg",
            feed: "/rss/health",
            descriptionKey: "showcase.health.description",
            keywords: [
                "Pherus Health",
                "Health technology",
                "Personal health data",
                "Decentralised health system",
            ],
        },
        {
            slug: "collective",
            title: "Collective",
            img: "/showcase/collective.svg",
            feed: "/rss/collective",
            descriptionKey: "showcase.collective.description",
            keywords: [
                "Pherus Collective",
                "Community platform",
                "Shared ownership",
                "Decentralised community",
            ],
            homeCategory: "community",
        },
        {
            slug: "software",
            title: "Software",
            img: "/showcase/software.svg",
            feed: "/rss/software",
            descriptionKey:
                "overview.fields.software.description",
            keywords: [
                "Pherus Software",
                "Open source infrastructure",
                "Developer tools",
            ],
        },
        {
            slug: "transspace",
            title: "Transspace",
            img: "/showcase/transspace.svg",
            feed: "/rss/transspace",
            descriptionKey:
                "overview.fields.queer.description",
            keywords: [
                "Pherus Transspace",
                "Queer life and community",
            ],
            homeCategory: "community",
        },
        {
            slug: "laniina",
            title: "Laniina",
            img: "/showcase/laniina.svg",
            feed: "/rss/laniina",
            keywords: ["Pherus Laniina", "Pherus"],
        },
        {
            slug: "futa",
            title: "Futa",
            img: "/showcase/futa.svg",
            feed: "/rss/futa",
            keywords: ["Pherus Futa", "Pherus"],
        },
        {
            slug: "sora",
            title: "Sora",
            img: "/showcase/sora.svg",
            feed: "/rss/sora",
            keywords: ["Pherus Sora", "Pherus"],
        },
        {
            slug: "research",
            title: "Research",
            img: "/showcase/research.svg",
            descriptionKey: "showcase.research.description",
            keywords: [
                "Pherus Research",
                "Research and exploration",
                "Personal knowledge management",
                "Science",
            ],
            tags: ["Research", "Exploration", "Science"],
            stack: [
                "Zettelkasten",
                "Roam",
                "Personal Knowledge Management",
            ],
            homeCategory: "research",
        },
    ],
})

const bodies = import.meta.glob<BasiccnContent>(
    "./showcase/*.json",
    { import: "default", eager: true }
)

export function resolveResource(slug: string) {
    const resource = showcase.items.find(
        (entry) => entry.slug === slug
    )
    if (!resource) return undefined

    return {
        ...resource,
        body: bodies[`./showcase/${slug}.json`],
    }
}

export function resourcesByHomeCategory(
    category: HomeCategory
) {
    return showcase.items.filter(
        (entry) => entry.homeCategory === category
    )
}
