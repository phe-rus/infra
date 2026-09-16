export type Resource = {
    slug: string
    title: string
    img: string
    /** RSS feed path, only set for resources with a public feed (drives the landing page marquee). */
    feed?: string
    description?: string
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
        description:
            "A personal identity system built on the idea of owning your identity. Its a decentralised system that allows you to control your own identity. It is built using modern web technologies and follows open standards.",
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
        description:
            "A personal health system built on the idea of owning your health. Its a decentralised system that allows you to control your own health. It is built using modern web technologies and follows open standards.",
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
        description:
            "A system built on the idea of shared ownership. Its a decentralised system that allows you to build and create systems together.",
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
        description:
            "Research and exploration into various fields. This is where we document our findings and share them with the world.",
        tags: ["Research", "Exploration", "Science"],
        stack: [
            "Zettelkasten",
            "Roam",
            "Personal Knowledge Management",
        ],
    },
]
