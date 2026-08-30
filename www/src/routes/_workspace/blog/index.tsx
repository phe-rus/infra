import { posts } from "@/lib/config"
import { seo } from "@/lib/seo"
import { Badge } from "@infra/ui/components/badge"
import { cn } from "@infra/ui/lib/utils"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/_workspace/blog/")({
    head: () => ({
        meta: seo({
            title: "Blog",
            description: "Research notes from every resource, published as we learn it.",
        }),
    }),
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <ViewController
            className="md:max-w-4xl"
            heading={
                <ViewController.Heading
                    title="Blog"
                    description="Research notes from every resource, published as we learn it."
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
                                "aspect-video rounded-none flex items-center justify-center",
                                "shadow group-hover:shadow-md transition-shadow",
                                post.cover
                            )}
                        >
                            <img src="/favicon.svg" alt="" className="size-10" />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{post.resource}</Badge>
                                <span className="text-xs text-muted-foreground">{post.date}</span>
                            </div>
                            <div>
                                <h2 className="text-base font-semibold leading-snug">{post.title}</h2>
                                <p className="text-muted-foreground">{post.excerpt}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </ViewController>
    )
}
