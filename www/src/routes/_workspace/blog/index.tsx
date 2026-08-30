import { Badge } from "@infra/ui/components/badge"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { createFileRoute, Link } from "@tanstack/react-router"
import { posts } from "@/content/blog"

export const Route = createFileRoute("/_workspace/blog/")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title="Blog"
                    description="Research notes from every division, published as we learn it."
                />
            }
        >
            <div className="flex flex-col gap-8">
                {posts.map((post) => (
                    <Link
                        key={post.slug}
                        to="/blog/$slug"
                        params={{ slug: post.slug }}
                        className="flex flex-col gap-2 border-b border-border/35 pb-8 last:border-none"
                    >
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{post.division}</Badge>
                            <span className="text-xs text-muted-foreground">{post.date}</span>
                        </div>
                        <h2 className="text-xl font-semibold">{post.title}</h2>
                        <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                    </Link>
                ))}
            </div>
        </ViewController>
    )
}
