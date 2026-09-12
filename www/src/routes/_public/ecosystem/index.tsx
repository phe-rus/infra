import { Closing } from "@/components/closing"
import { EcosystemSpine } from "@/components/ecosystem-spine"
import {
    InfiniteRibbon,
    type RibbonItem,
} from "@/components/infinite-ribbon"
import { domains, initiatives } from "@/lib/ecosystem"
import { getDictionary } from "@/lib/i18n"
import { seo } from "@/lib/seo"
import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"

export const Route = createFileRoute("/_public/ecosystem/")({
    head: () =>
        seo({
            title: "Ecosystem",
            description:
                "The initiatives Pherus is building, researching, or exploring, and how they relate.",
            path: "/ecosystem",
        }),
    component: RouteComponent,
})

function RouteComponent() {
    const t = getDictionary()

    const conceptItems: RibbonItem[] = useMemo(() => {
        const kinds = Array.from(
            new Set(initiatives.map((item) => item.kind))
        )
        return [...domains.map((d) => d.label), ...kinds].map(
            (label) => ({
                type: "text" as const,
                key: label,
                label,
            })
        )
    }, [])

    return (
        <article className="flex flex-col">
            <section className="container w-full py-10 md:py-16">
                <span className="block font-mono text-xs tracking-[0.2em] text-muted-foreground">
                    03 / 03
                </span>
                <h1 className="mt-6 max-w-2xl text-balance text-3xl leading-[1.15] font-medium tracking-tight md:text-5xl">
                    {t.ecosystem.title}
                </h1>
                <p className="mt-4 max-w-xl text-muted-foreground">
                    {t.ecosystem.intro}
                </p>
            </section>

            <div className="border-y border-border/35 py-8">
                <InfiniteRibbon
                    items={conceptItems}
                    duration={30}
                    reverse
                />
            </div>

            <div className="pt-16 pb-24 md:pt-20 md:pb-32">
                <EcosystemSpine detailed />
            </div>

            <Closing />
        </article>
    )
}
