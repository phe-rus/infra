import { config, isNavGroup } from "@/components/headers/config"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@infra/ui/components/badge"
import { Button } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useMemo } from "react"

export const Route = createFileRoute("/_workspace/")({
    component: RouteComponent,
})

function RouteComponent() {
    const divisions = useMemo(() => {
        const resources = config.find((item) => item.label === "Resources")
        if (!resources || !isNavGroup(resources)) return []
        return resources.items.flatMap((section) =>
            section.items.map((leaf) => ({
                label: leaf.label,
                slug: leaf.to.replace("/r/", ""),
                tag: leaf.tag,
            }))
        )
    }, [])

    const communityLinks = useMemo(
        () => [
            { label: "Discussions", description: "Ask questions, share ideas, and help others." },
            { label: "GitHub", description: "Join one of our GitHub organizations." },
            { label: "Bug reporting", description: "See an issue? Let us know." },
        ],
        []
    )

    return (
        <article className="flex flex-col">
            <section
                className={cn(
                    "container flex flex-col py-30 w-full",
                    "md:max-w-4xl gap-5"
                )}
            >
                <div className="md:max-w-2xl">
                    <span>pherus</span>
                    <h1 className="text-4xl font-bold">
                        Let us show you our wildest dreams &
                        imaginations.
                    </h1>
                    <p>Now see the world through our eyes.</p>
                </div>
                <p className="md:max-w-md">
                    We are a collective of like-minded
                    individuals driven by curiosity and a
                    drive to innovate.
                </p>
            </section>

            <div>
                <section
                    className={cn(
                        "container flex flex-col py-30 w-full",
                        "md:max-w-4xl gap-5"
                    )}
                >
                    <div>
                        <h2>What we are working on</h2>
                        <p className="md:max-w-md">
                            Products and services we are
                            working on, at pherus
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {divisions.map((item) => (
                            <Link
                                key={item.slug}
                                to="/r/$slug"
                                params={{ slug: item.slug }}
                                className={cn(
                                    "relative flex items-center px-3",
                                    "bg-accent/35 hover:bg-accent/65 rounded-2xl shadow",
                                    "hover:shadow-md gap-2 py-2",
                                    "cursor-pointer"
                                )}
                            >
                                <img
                                    src="/favicon.svg"
                                    alt={item.label}
                                    className="size-4.5"
                                />
                                <h2 className="text-xs">
                                    {item.label}
                                </h2>
                                <div className="absolute -top-4 right-5">
                                    <Badge
                                        variant='secondary'
                                        className="text-[4px]! h-fit!"
                                    >
                                        {item.tag}
                                    </Badge>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>

            <div className="bg-green-300/5">
                <section
                    className={cn(
                        "container flex flex-col py-30 w-full",
                        "md:max-w-4xl gap-5"
                    )}
                >
                    <div className="md:max-w-2xl">
                        <h1>
                            Tell us what you want to make. We
                            research it, build it, and give
                            you the how
                        </h1>
                        <p>
                            Most of what we learn gets shared
                            openly, ideas, research, and most
                            of the code included. It's the
                            same approach behind every
                            division here.
                        </p>
                    </div>

                    <Link
                        to="/blog/$slug"
                        params={{ slug: "why-this-blog-exists" }}
                        className={cn(
                            "flex items-center gap-2 hover:underline",
                            "text-sm decoration-wavy"
                        )}
                    >
                        Read how we work
                        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                    </Link>
                </section>
            </div>

            <div className="bg-taupe-400/5">
                <section
                    className={cn(
                        "container flex flex-col py-30 w-full",
                        "md:max-w-4xl gap-5"
                    )}
                >
                    <blockquote className="text-2xl font-medium md:max-w-2xl">
                        "We do not gather people for titles, status, or
                        recognition. We are drawn to those who ask
                        questions, seek understanding, and build without
                        waiting for permission."
                    </blockquote>
                    <div className="flex items-center gap-3">
                        <img
                            src="/favicon.svg"
                            alt="Pherus logo"
                            className="size-8 rounded-full"
                        />
                        <div>
                            <p className="text-sm font-medium">
                                Tiabah La niina
                            </p>
                            <p className="text-xs text-muted-foreground">
                                CEO & Founder, Pherus
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <section
                className={cn(
                    "container flex flex-col py-35 md:py-50 w-full",
                    "relative md:max-w-4xl gap-5"
                )}
            >
                <div className="mx-auto text-center">
                    <h1 className="text-6xl">
                        Be in the mix
                        <br />
                        with herus.
                    </h1>
                    <p className="md:max-w-md mx-auto">
                        Sign up to receive tailored
                        communications from pherus with news,
                        offers, events, and more.
                    </p>
                </div>

                <div className="flex flex-col gap-1 mx-auto">
                    <Button
                        size="lg"
                        className="rounded-full"
                    >
                        <img
                            src={"/favicon.svg"}
                            alt="Infra logo"
                            className="size-4.5! border"
                        />
                        Sign up with infra
                    </Button>
                    <Button
                        size="lg"
                        variant="secondary"
                        className="rounded-full"
                    >
                        or enter another email
                    </Button>
                </div>

                <div
                    className={cn(
                        "container absolute right-0 left-0 bottom-0",
                        "w-full overflow-hidden"
                    )}
                >
                    <img
                        src="/avatar/red.jpg"
                        alt="pherus"
                        className={cn(
                            "h-32! w-62! mx-auto! rounded-b-none",
                            'rounded-t-full'
                        )}
                    />
                </div>
            </section>

            <div className="bg-input/15">
                <section
                    className={cn(
                        "container flex flex-col py-30 w-full",
                        "md:max-w-4xl gap-5"
                    )}
                >
                    <div>
                        <h1 className="text-4xl font-bold">
                            Join the Pherus community
                        </h1>
                        <p className="max-w-md">
                            Share what you're building. Show
                            off your work. Give feedback. Ask
                            questions. Meet other people who
                            build with Pherus.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {communityLinks.map((item, idx) => (
                            <article
                                key={idx}
                                className={cn(
                                    "flex flex-col p-3 rounded-2xl shadow",
                                    "hover:shadow-md gap-1 cursor-pointer",
                                    "gap-3 border border-border/35 bg-input"
                                )}
                            >
                                <img
                                    src="/favicon.svg"
                                    alt={item.label}
                                    className="size-12 rounded-full"
                                />
                                <div className="flex flex-col">
                                    <h2>{item.label}</h2>
                                    <p className="text-xs">
                                        {item.description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </article>
    )
}
