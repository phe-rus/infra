import { Badge } from "@infra/ui/components/badge"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { Markdown } from "@tanstack/markdown/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { createFileRoute, Link } from "@tanstack/react-router"
import { getPostBody, posts } from "@/content/blog"

export const Route = createFileRoute("/_workspace/blog/$slug")({
    component: RouteComponent,
})

function RouteComponent() {
    const { slug } = Route.useParams()
    const post = posts.find((item) => item.slug === slug)
    const body = getPostBody(slug)

    if (!post || !body) {
        return (
            <ViewController heading={<ViewController.Heading title="Post not found" />}>
                <Link to="/blog" className="flex items-center gap-1 text-sm text-muted-foreground">
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
                    Back to blog
                </Link>
            </ViewController>
        )
    }

    return (
        <ViewController
            heading={
                <div className="flex flex-col gap-3">
                    <Link
                        to="/blog"
                        className="flex items-center gap-1 text-sm text-muted-foreground"
                    >
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
                        Back to blog
                    </Link>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{post.division}</Badge>
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                    <ViewController.Heading title={post.title} size="compact" />
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                <Markdown>{body}</Markdown>
            </div>
        </ViewController>
    )
}
