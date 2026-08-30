import { Badge } from "@infra/ui/components/badge"
import { cn } from "@infra/ui/lib/utils"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useMemo } from "react"

export const Route = createFileRoute("/_workspace/blog/")({
    component: RouteComponent,
})

function RouteComponent() {
    const posts = useMemo(
        () => [
            {
                slug: "why-this-blog-exists",
                title: "Why this blog exists",
                division: "Pherus",
                date: "2026-08-30",
                excerpt:
                    "Most of what a division learns gets written up here as it happens, not cleaned up afterward. Here's the rule this blog runs on.",
                cover: "bg-neutral-200 dark:bg-neutral-800",
            },
            {
                slug: "rate-limiting-auth-across-three-apps",
                title: "Rate-limiting auth across three apps without slowing anyone down",
                division: "Infra",
                date: "2026-08-28",
                excerpt:
                    "The tiered rate-limiter behind sign-in, sessions, and account changes, and the boundary we didn't know we were relying on until we read the source.",
                cover: "bg-teal-100 dark:bg-teal-950",
            },
            {
                slug: "mapping-queer-resources-in-uganda",
                title: "Mapping queer resources in Uganda, one contributor at a time",
                division: "Transspace",
                date: "2026-08-20",
                excerpt:
                    "How the first resource categories got chosen, and what we learned asking people directly instead of guessing.",
                cover: "bg-rose-100 dark:bg-rose-950",
            },
            {
                slug: "what-actually-goes-into-a-bar-of-soap",
                title: "What actually goes into a bar of soap",
                division: "Seer",
                date: "2026-08-12",
                excerpt:
                    "The first formula write-up: why shea nut oil, what we tested against it, and the full ingredient list before anything shipped.",
                cover: "bg-amber-100 dark:bg-amber-950",
            },
        ],
        []
    )

    return (
        <ViewController
            className="md:max-w-5xl"
            heading={
                <ViewController.Heading
                    title="Blog"
                    description="Research notes from every division, published as we learn it."
                />
            }
        >
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                {posts.map((post) => (
                    <Link
                        key={post.slug}
                        to="/blog/$slug"
                        params={{ slug: post.slug }}
                        className="flex flex-col gap-3 break-inside-avoid mb-6 group"
                    >
                        <div
                            className={cn(
                                "aspect-video rounded-2xl flex items-center justify-center",
                                "shadow group-hover:shadow-md transition-shadow",
                                post.cover
                            )}
                        >
                            <img src="/favicon.svg" alt="" className="size-10" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{post.division}</Badge>
                            <span className="text-xs text-muted-foreground">{post.date}</span>
                        </div>
                        <h2 className="text-lg font-semibold leading-snug">{post.title}</h2>
                        <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                    </Link>
                ))}
            </div>
        </ViewController>
    )
}
