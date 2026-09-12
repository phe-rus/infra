import { Closing } from "@/components/closing"
import { EcosystemShowcase } from "@/components/ecosystem-showcase"
import {
    InfiniteRibbon,
    type RibbonItem,
} from "@/components/infinite-ribbon"
import { initiatives } from "@/lib/ecosystem"
import { getDictionary } from "@/lib/i18n"
import { seo } from "@/lib/seo"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useMemo } from "react"

export const Route = createFileRoute("/_public/showcase/")({
    head: () =>
        seo({
            title: "Showcase",
            description:
                "A closer look at what Pherus is building, researching, or exploring.",
            path: "/showcase",
        }),
    component: RouteComponent,
})

function RouteComponent() {
    const t = getDictionary()

    const ribbonItems: RibbonItem[] = useMemo(
        () =>
            initiatives.map((item) => ({
                type: "frame" as const,
                key: item.slug,
                url: `pherus.org/showcase/${item.slug}`,
                mark: item.name,
            })),
        []
    )

    return (
        <article className="flex flex-col">
            <section className="container w-full py-10 md:py-16">
                <span className="block font-mono text-xs tracking-[0.2em] text-muted-foreground">
                    02 / 03
                </span>
                <h1 className="mt-6 max-w-2xl text-balance text-3xl leading-[1.15] font-medium tracking-tight md:text-5xl">
                    {t.showcase.title}
                </h1>
                <p className="mt-4 max-w-xl text-muted-foreground">
                    {t.showcase.intro}
                </p>
            </section>

            <div className="pb-16 md:pb-20">
                <EcosystemShowcase />
            </div>

            <div className="border-y border-border/35 py-10">
                <InfiniteRibbon
                    items={ribbonItems}
                    duration={50}
                />
            </div>

            <div className="container flex w-full justify-center py-10">
                <Link
                    to="/ecosystem"
                    className="group inline-flex items-center gap-2 text-sm"
                >
                    <span className="decoration-wavy group-hover:underline">
                        {t.home.moreCta}
                    </span>
                    <span
                        aria-hidden
                        className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 motion-reduce:transition-none"
                    >
                        /
                    </span>
                </Link>
            </div>

            <Closing />
        </article>
    )
}
