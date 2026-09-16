import { z } from "zod"
import { defaultHandlers } from "./lib/handler"
import { messageKey } from "./lib/message-key"

const ResourceSchema = z.object({
    slug: z.string(),
    title: z.string(),
    img: z.string(),
    /** RSS feed path, only set for resources with a public feed (drives the landing page marquee). */
    feed: z.string().optional(),
    descriptionKey: messageKey.optional(),
    tags: z.array(z.string()).optional(),
    stack: z.array(z.string()).optional(),
    catalogs: z.array(z.string()).optional(),
})

const ShowcaseSchema = z.object({
    index: z.object({
        path: z.literal("/showcase"),
        titleKey: messageKey,
        descriptionKey: messageKey,
    }),
    items: z.array(ResourceSchema),
})

export type Resource = z.infer<typeof ResourceSchema>

export const showcase = defaultHandlers(ShowcaseSchema)({
    index: {
        path: "/showcase",
        titleKey: "nav.showcase",
        descriptionKey: "showcase.hero.description",
    },
    items: [
        {
            slug: "pass",
            title: "Pass",
            img: "/og.png",
            feed: "/rss/pass",
            descriptionKey: "showcase.pass.description",
            tags: [
                "Identity",
                "Decentralised",
                "Open standards",
            ],
            stack: [
                "bun",
                "React",
                "Next.js",
                "Tailwind CSS",
                "TypeScript",
            ],
            catalogs: ["Infra", "Accounts"],
        },
        {
            slug: "health",
            title: "Health",
            img: "/og.png",
            feed: "/rss/health",
            descriptionKey: "showcase.health.description",
            tags: [
                "Identity",
                "Decentralised",
                "Open standards",
            ],
            stack: [
                "bun",
                "React",
                "Next.js",
                "Tailwind CSS",
                "TypeScript",
            ],
        },
        {
            slug: "collective",
            title: "Collective",
            img: "/og.png",
            feed: "/rss/collective",
            descriptionKey: "showcase.collective.description",
            tags: [
                "Organisation",
                "Decentralised",
                "Collective action",
            ],
            stack: [
                "bun",
                "React",
                "Next.js",
                "Tailwind CSS",
                "TypeScript",
            ],
        },
        {
            slug: "software",
            title: "Software",
            img: "/og.png",
            feed: "/rss/software",
        },
        {
            slug: "transspace",
            title: "Transspace",
            img: "/og.png",
            feed: "/rss/transspace",
        },
        {
            slug: "laniina",
            title: "Laniina",
            img: "/og.png",
            feed: "/rss/laniina",
        },
        {
            slug: "futa",
            title: "Futa",
            img: "/og.png",
            feed: "/rss/futa",
        },
        {
            slug: "sora",
            title: "Sora",
            img: "/og.png",
            feed: "/rss/sora",
        },
        {
            slug: "research",
            title: "Research",
            img: "/og.png",
            descriptionKey: "showcase.research.description",
            tags: ["Research", "Exploration", "Science"],
            stack: [
                "Zettelkasten",
                "Roam",
                "Personal Knowledge Management",
            ],
        },
    ],
})
