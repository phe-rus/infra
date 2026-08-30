import { Badge } from "@infra/ui/components/badge"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useMemo } from "react"

export const Route = createFileRoute("/_workspace/blog/$slug")({
    component: RouteComponent,
})

type Block = { h2: string } | { p: string } | { ul: string[] }

function RouteComponent() {
    const { slug } = Route.useParams()

    const posts: { slug: string; title: string; division: string; date: string; body: Block[] }[] = useMemo(
        () => [
            {
                slug: "why-this-blog-exists",
                title: "Why this blog exists",
                division: "Pherus",
                date: "2026-08-30",
                body: [
                    {
                        p: "Every company says it's building something. Fewer show the part where they figured out how. This blog is that part, published as it happens rather than cleaned up afterward.",
                    },
                    { h2: "The rule" },
                    {
                        p: "Most of what a division learns gets written up here: why a formula, a resource category, or a piece of infrastructure ended up the way it did, including the version that didn't work first. That's the same principle behind every division on this site, made explicit. Understand the problem, then share what was learned along the way, not just the finished result.",
                    },
                    { h2: "What that means in practice" },
                    {
                        ul: [
                            "A cosmetics division publishes its actual ingredient list and the reasoning behind it, not a marketing description of it.",
                            "A community platform explains how it chose its first categories by asking people directly, not by assuming.",
                            "An infrastructure team writes up the exact bug it found in its own authentication layer, including the part where the bug was already live before anyone noticed.",
                        ],
                    },
                    {
                        p: "None of these posts are announcements. They're the notes, published instead of thrown away.",
                    },
                    { h2: "What to expect here" },
                    {
                        p: "Posts are attributed by division, not by author, because the point is the work, not the byline. New posts show up when a division has something real to report, not on a schedule. If a post here turns out to be wrong or incomplete later, the correction gets published too, not quietly edited away.",
                    },
                ],
            },
            {
                slug: "rate-limiting-auth-across-three-apps",
                title: "Rate-limiting auth across three apps without slowing anyone down",
                division: "Infra",
                date: "2026-08-28",
                body: [
                    {
                        p: "Infra is the authentication layer every Pherus product sits behind, which means one rate-limiter mistake affects everything at once. Here's what we actually found when we went looking for gaps.",
                    },
                    { h2: "The surprise: not everything is rate-limited" },
                    {
                        p: "The library we build on ships two separate code paths: one for direct in-process calls, one for real HTTP requests. Rate limiting only runs on the second path. That means an admin dashboard calling into auth directly, in the same process, was never touching the rate limiter at all, no matter how the limits were configured. Only genuine browser requests through the public API were ever covered.",
                    },
                    {
                        p: "That's not a bug in the library, it's a boundary we didn't know we were relying on until we read the source directly instead of assuming.",
                    },
                    { h2: "What we changed" },
                    {
                        p: "The library also ships sensible defaults for the obvious targets, sign-in, sign-up, password resets, a few requests per short window. We added explicit limits for the paths that don't get a default: session checks, sign-out, profile updates, account deletion, scaled to how much damage a burst of each one could do. Account deletion got the tightest limit of the new set, close to sign-in's own default, on purpose.",
                    },
                    { h2: "Why this is worth writing down" },
                    {
                        p: "Every one of these numbers is a judgment call, not a formula. Publishing the reasoning here means the next person adjusting a limit is working from \"here's why this number\" instead of guessing at what a stranger meant six months ago, whether that next person is on this team or reading along.",
                    },
                ],
            },
            {
                slug: "mapping-queer-resources-in-uganda",
                title: "Mapping queer resources in Uganda, one contributor at a time",
                division: "Transspace",
                date: "2026-08-20",
                body: [
                    {
                        p: "Transspace started from a personal problem: while navigating a transition in Uganda, reliable information about healthcare providers, safe spaces, and legal support existed, but only as word of mouth, scattered across private conversations and group chats that anyone new to the community had no way to find.",
                    },
                    { h2: "Choosing the first categories" },
                    {
                        p: "Rather than guess at a taxonomy, the first categories came from asking people directly what they'd searched for and failed to find:",
                    },
                    {
                        ul: [
                            "Healthcare and transition support",
                            "Friendly spaces, businesses and venues",
                            "Jobs and mentorship",
                            "Legal and education support",
                            "Mutual aid",
                        ],
                    },
                    {
                        p: "That list will keep changing. It's a record of what people actually needed when we asked, not a fixed structure to defend later.",
                    },
                    { h2: "What surprised us" },
                    {
                        p: "The knowledge people were willing to share was almost always local and specific, a named clinic, a named landlord, a named person to talk to, rather than general advice. General advice was already everywhere. What was missing was the specific, verified, current version of it. That's the gap Transspace is actually trying to close.",
                    },
                    { h2: "Where this goes next" },
                    {
                        p: "Local knowledge, shared with people facing the same situation somewhere else. Someone in Kenya benefiting from something first documented in Uganda. That's the whole mechanism, and it only works if the first round of categories are honest about what people actually asked for.",
                    },
                ],
            },
            {
                slug: "what-actually-goes-into-a-bar-of-soap",
                title: "What actually goes into a bar of soap",
                division: "Seer",
                date: "2026-08-12",
                body: [
                    {
                        p: "Most cosmetics companies treat the ingredient list as a legal requirement, something to get past, not something to explain. Seer is starting from the opposite direction: the formula is the product page.",
                    },
                    { h2: "Why shea nut oil" },
                    {
                        p: "We picked shea nut oil as the base for the first line for three reasons: it's solid at room temperature without hydrogenation, it carries fragrance and essential oils without going rancid quickly, and it's a single ingredient doing the work three or four synthetic ones usually split between them in mass-market bars.",
                    },
                    {
                        p: "That last point mattered more than it sounds. Every additional ingredient is another thing to source, another thing to disclose, another place for something to go wrong on someone's skin. Fewer ingredients, chosen deliberately, beats a longer list optimized for shelf life.",
                    },
                    { h2: "What we tested against it" },
                    {
                        ul: [
                            "Cold-process vs. melt-and-pour: cold-process won on texture, lost on batch consistency early on. Still tuning the cure time.",
                            "Essential oil load: too little and the scent doesn't survive the cure; too much and it irritates. Landed around 3% by weight for the first batch.",
                            "Additive-free hardness: shea alone is softer than a bar needs to be for a normal shower life. Still open, not solved yet.",
                        ],
                    },
                    { h2: "The list, as it ships" },
                    {
                        p: "Saponified shea nut oil, essential oil blend, nothing else. If that changes before launch, this post gets updated, not quietly edited.",
                    },
                ],
            },
        ],
        []
    )

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
