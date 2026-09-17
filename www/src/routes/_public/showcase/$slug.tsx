import { m } from "@/paraglide/messages"
import { cn } from "@infra/ui/lib/utils"
import { resolveResource } from "@data/showcase"
import { renderDoc } from "@data/lib/tiptap-doc"
import { reveal } from "@lib/motion"
import { seo } from "@lib/seo"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/_public/showcase/$slug"
)({
    head: ({ params }) => {
        const resource = resolveResource(params.slug)

        return seo({
            title: resource?.title ?? params.slug,
            description: resource?.descriptionKey
                ? m[resource.descriptionKey]()
                : undefined,
            image: resource?.img,
            path: `/showcase/${params.slug}`,
        })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { slug } = Route.useParams()
    const resource = resolveResource(slug)

    if (!resource) {
        return (
            <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
                <section className="container flex flex-col gap-5">
                    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 text-center">
                        <p className="text-base text-muted-foreground">
                            {m["showcase.detail.notFound"]()}
                        </p>
                        <Link
                            to="/showcase"
                            className="underline"
                        >
                            {m["showcase.detail.back"]()}
                        </Link>
                    </div>
                </section>
            </article>
        )
    }

    return (
        <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
            <section className="container flex flex-col gap-5">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
                    <Link
                        to="/showcase"
                        className="text-sm text-muted-foreground underline"
                    >
                        {m["showcase.detail.back"]()}
                    </Link>

                    <div className="relative w-full h-40 md:h-56 overflow-hidden rounded-md">
                        <img
                            src={resource.img}
                            alt={resource.title}
                            className="absolute inset-0 size-full object-cover"
                            data-not-typeset
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <motion.h1
                            {...reveal}
                            className="font-black"
                        >
                            {resource.title}
                        </motion.h1>

                        {resource.status === "active" && (
                            <span className="rounded-full border border-primary/40 px-2 py-0.5 text-xs font-semibold text-primary">
                                Live
                            </span>
                        )}
                    </div>

                    {resource.descriptionKey && (
                        <motion.p
                            {...reveal}
                            className="max-w-md text-base"
                        >
                            {m[resource.descriptionKey]()}
                        </motion.p>
                    )}

                    {resource.body && (
                        <div className="flex flex-col gap-3">
                            {renderDoc(resource.body)}
                        </div>
                    )}

                    {resource.links && (
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-black">
                                Links
                            </h2>
                            <div className="flex flex-col gap-1">
                                {resource.links.map(
                                    (link) => (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            className="text-sm text-muted-foreground underline w-fit"
                                        >
                                            {link.label}
                                        </a>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {resource.tags && (
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-black">
                                {m["showcase.detail.tags"]()}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {resource.tags
                                    .map((tag) => `#${tag}`)
                                    .join(", ")}
                            </p>
                        </div>
                    )}

                    {resource.stack && (
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-black">
                                {m["showcase.detail.stack"]()}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {resource.stack
                                    .map((tag) => `#${tag}`)
                                    .join(", ")}
                            </p>
                        </div>
                    )}

                    {resource.catalogs && (
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-black">
                                {m[
                                    "showcase.detail.usedBy"
                                ]()}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {resource.catalogs.join(", ")}
                            </p>
                        </div>
                    )}

                    {resource.feed && (
                        <a
                            href={resource.feed}
                            className={cn(
                                "text-sm text-muted-foreground underline",
                                "w-fit"
                            )}
                        >
                            RSS
                        </a>
                    )}
                </div>
            </section>
        </article>
    )
}
