export type Resource = {
    slug: string
    title: string
    img: string
    /** RSS feed path, only set for resources with a public feed (drives the landing page marquee). */
    feed?: string
    /** Paraglide message id for the translated description, resolved at render time (not here — this array is built once at module load). */
    descriptionKey?:
        | "showcase.pass.description"
        | "showcase.health.description"
        | "showcase.collective.description"
        | "showcase.research.description"
    tags?: string[]
    stack?: string[]
    catalogs?: string[]
}

export const resources: Resource[] = [
    {
        slug: "pass",
        title: "Pass",
        img: "/og.png",
        feed: "/rss/pass",
        descriptionKey: "showcase.pass.description",
        tags: ["Identity", "Decentralised", "Open standards"],
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
        tags: ["Identity", "Decentralised", "Open standards"],
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
]
