import { BrowserFrame } from "@/components/browser-frame"
import { Closing } from "@/components/closing"
import { Timeline } from "@/components/timeline"
import {
    STATUS_LABEL,
    type InitiativeStatus,
} from "@/lib/ecosystem"
import { getDictionary } from "@/lib/i18n"
import { seo } from "@/lib/seo"
import { createFileRoute, Link } from "@tanstack/react-router"

const STATUS_ORDER: InitiativeStatus[] = [
    "live",
    "in-development",
    "research",
    "experimental",
    "planned",
    "archived",
]

export const Route = createFileRoute("/_public/about/")({
    head: () =>
        seo({
            title: "About",
            description: "What Pherus is, and why it exists.",
            path: "/about",
        }),
    component: RouteComponent,
})

function RouteComponent() {
    const t = getDictionary()

    return (
        <article className="flex flex-col">
            <section className="container grid w-full grid-cols-1 gap-8 py-10 md:grid-cols-[1.2fr_1fr] md:items-center md:py-16">
                <div>
                    <span className="block font-mono text-xs tracking-[0.2em] text-muted-foreground">
                        02 / 03
                    </span>
                    <h1 className="mt-6 max-w-xl text-balance text-3xl leading-[1.15] font-medium tracking-tight md:text-5xl">
                        {t.about.whyLede}
                    </h1>
                </div>
                <div className="aspect-video w-full">
                    <BrowserFrame
                        url="pherus.org/about"
                        mark={t.about.title}
                    />
                </div>
            </section>

            <section className="border-t border-border/35">
                <div className="container flex w-full flex-col items-center gap-6 py-16 text-center md:py-20">
                    <div className="aspect-video w-full max-w-xs">
                        <BrowserFrame
                            url="pherus.org/pherusa"
                            mark="Pherusa"
                        />
                    </div>
                    <p className="max-w-md text-2xl leading-snug font-medium tracking-tight italic md:text-3xl">
                        {t.about.nameLede}
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        {t.about.nameBody}
                    </p>
                </div>
            </section>

            <section className="border-t border-border/35 py-16 md:py-20">
                <div className="container mb-8 w-full">
                    <span className="text-xs tracking-wide text-muted-foreground uppercase">
                        {t.about.historyLabel}
                    </span>
                </div>
                <Timeline />
            </section>

            <section className="border-t border-border/35">
                <div className="container grid w-full grid-cols-1 gap-6 py-16 md:grid-cols-2 md:py-20">
                    <p className="text-2xl leading-snug font-medium tracking-tight md:text-3xl">
                        {t.about.notProfitLede}
                    </p>
                    <p className="text-2xl leading-snug font-medium tracking-tight md:text-3xl">
                        {t.about.honestyLede}
                    </p>
                </div>
                <div className="container flex w-full flex-wrap gap-x-4 gap-y-2 pb-16 text-xs tracking-wide text-muted-foreground uppercase md:pb-20">
                    {STATUS_ORDER.map((status) => (
                        <span
                            key={status}
                            className="border border-border/40 px-2 py-1"
                        >
                            {STATUS_LABEL[status]}
                        </span>
                    ))}
                </div>
            </section>

            <section className="border-t border-border/35">
                <div className="container w-full py-16 md:py-20">
                    <h2 className="text-xl font-medium tracking-tight md:text-2xl">
                        {t.about.enduringHeading}
                    </h2>
                    <p className="mt-3 max-w-md text-muted-foreground">
                        {t.about.enduringBody}
                    </p>
                    <div className="mt-10 flex items-center gap-3 text-xs tracking-wide text-muted-foreground uppercase">
                        {[
                            t.about.flowFounder,
                            t.about.flowPrinciples,
                            t.about.flowFuture,
                        ].map((label, idx, arr) => (
                            <div
                                key={label}
                                className="flex items-center gap-3"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <span className="size-2 rounded-full bg-muted-foreground" />
                                    <span>{label}</span>
                                </div>
                                {idx < arr.length - 1 && (
                                    <span
                                        aria-hidden
                                        className="mb-5 h-px w-8 bg-border md:w-12"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container w-full py-10">
                <Link
                    to="/ecosystem"
                    className="w-fit text-sm decoration-wavy hover:underline"
                >
                    {t.about.cta}
                </Link>
            </div>

            <Closing />
        </article>
    )
}
