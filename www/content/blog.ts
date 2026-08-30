export interface BlogPost {
    slug: string
    title: string
    division: string
    date: string
    excerpt: string
}

export const posts: BlogPost[] = [
    {
        slug: "rate-limiting-auth-across-three-apps",
        title: "Rate-limiting auth across three apps without slowing anyone down",
        division: "Infra",
        date: "2026-08-28",
        excerpt:
            "The tiered rate-limiter behind sign-in, sessions, and account changes, and the boundary we didn't know we were relying on until we read the source.",
    },
    {
        slug: "mapping-queer-resources-in-uganda",
        title: "Mapping queer resources in Uganda, one contributor at a time",
        division: "Transspace",
        date: "2026-08-20",
        excerpt:
            "How the first resource categories got chosen, and what we learned asking people directly instead of guessing.",
    },
    {
        slug: "what-actually-goes-into-a-bar-of-soap",
        title: "What actually goes into a bar of soap",
        division: "Seer",
        date: "2026-08-12",
        excerpt:
            "The first formula write-up: why shea nut oil, what we tested against it, and the full ingredient list before anything shipped.",
    },
]

const files = import.meta.glob("./blog/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
}) as Record<string, string>

export function getPostBody(slug: string): string | undefined {
    return files[`./blog/${slug}.md`]
}
