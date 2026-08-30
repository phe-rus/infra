import { posts } from "@/lib/config"
import { seo } from "@/lib/seo"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@infra/ui/components/badge"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/_workspace/blog/$slug")({
    head: ({ params }) => {
        const post = posts.find((item) => item.slug === params.slug)
        return {
            meta: seo({
                title: post?.title ?? "Post not found",
                description: post?.excerpt,
                type: "article",
            }),
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { slug } = Route.useParams()
    const post = posts.find((item) => item.slug === slug)

    if (!post) {
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
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{post.resource}</Badge>
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                    <ViewController.Heading title={post.title} size="compact" />
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                {post.body.map((block, idx) => {
                    if ("h2" in block) {
                        return <h2 key={idx}>{block.h2}</h2>
                    }
                    if ("ul" in block) {
                        return (
                            <ul key={idx} className="list-disc pl-5 flex flex-col gap-1">
                                {block.ul.map((item, itemIdx) => (
                                    <li key={itemIdx}>{item}</li>
                                ))}
                            </ul>
                        )
                    }
                    return <p key={idx}>{block.p}</p>
                })}
            </div>
        </ViewController>
    )
}
