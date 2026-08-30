import { Button } from "@infra/ui/components/button"
import { cn } from "@infra/ui/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/_workspace/")({
    component: RouteComponent,
})

function RouteComponent() {
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
                        {[
                            {
                                label: "Infra",
                                img: "/favicon.svg",
                                status: "active",
                                description:
                                    "Unified authentication platform",
                            },
                            {
                                label: "Accounts",
                                img: "/favicon.svg",
                                status: "active",
                                description:
                                    "Unified user management plaform",
                            },
                            {
                                label: "Seer",
                                img: "/favicon.svg",
                                status: "in development",
                                description:
                                    "Cosmetics built in the open, ingredient research and DIY formulas published alongside the products.",
                            },
                            {
                                label: "Transspace",
                                img: "/favicon.svg",
                                status: "in development",
                                description:
                                    "Queer people helping queer people through shared knowledge and experience.",
                            },
                            {
                                label: "Pherus scholar",
                                img: "/favicon.svg",
                                status: "planning",
                                description:
                                    "A living archive of the world's cultures, starting in Africa.",
                            },
                            {
                                label: "Pherus health",
                                img: "/favicon.svg",
                                status: "planning",
                                description:
                                    "A holistic healthcare platform built around the whole person.",
                            },
                            {
                                label: "Pherus basic",
                                img: "/favicon.svg",
                                status: "planning",
                                description:
                                    "One small compute core, docked into whichever shell you need.",
                            },
                            {
                                label: "Pherus homes",
                                img: "/favicon.svg",
                                status: "planning",
                                description:
                                    "Shelter, food, and dignity, treated as engineering problems worth solving.",
                            },
                            {
                                label: "Pherus space & robotics",
                                img: "/favicon.svg",
                                status: "planning",
                                description:
                                    "Vehicles designed to be lived in, not just launched.",
                            },
                            {
                                label: "Pherus developers",
                                img: "/favicon.svg",
                                status: "planning",
                                description:
                                    "Every public repository, gathered into one structure.",
                            },
                            {
                                label: "Pherus assets",
                                img: "/favicon.svg",
                                status: "planning",
                                description:
                                    "Storage in your own Cloudflare account. You own the data and the bill.",
                            },
                            {
                                label: "Pherus agriculture",
                                img: "/favicon.svg",
                                status: "planning",
                                description:
                                    "Permaculture-structured food sharing, aid and income together.",
                            },
                        ].map((items, index) => {
                            return (
                                <article
                                    key={index}
                                    className={cn(
                                        "relative flex items-center px-3",
                                        "bg-input rounded-2xl shadow",
                                        "hover:shadow-md gap-1 py-2",
                                        "cursor-pointer"
                                    )}
                                >
                                    <img
                                        src={items.img}
                                        alt={items.label}
                                        className="size-4.5"
                                    />
                                    <h2 className="text-xs">
                                        {items.label}
                                    </h2>
                                </article>
                            )
                        })}
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
                        to="/"
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
                <section className="flex flex-col gap-5 py-20 min-w-full">
                    <div className="container flex flex-col md:max-w-4xl">
                        <h1>
                            Hear from others
                        </h1>
                        <p className="max-w-md">
                            Join hundreds of other organizations who've found
                            the answer to "build vs. buy."
                        </p>
                    </div>

                    <section className="overflow-hidden!">
                        <div
                            className={cn(
                                "flex flex-row items-center min-w-full",
                                "overflow-x-auto md:overscroll-contain gap-5",
                                'container no-scrollbar'
                            )}
                        >
                            {[
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                                {
                                    message: "Utilizing Payload enabled us to implement our digital postcards tool quickly and easily, engaging thousands of K-12 students.",
                                    attribution: "Heather Nelson, Director, Blue Origin",
                                },
                            ].map((item, idx) => {
                                return (
                                    <article
                                        key={idx}
                                        className={cn(
                                            "flex flex-col min-w-sm max-w-sm",
                                            "cursor-pointer gap-10"
                                        )}
                                    >
                                        <div>
                                            <h2 className='text-2xl'>{`"${item.message}"`}</h2>
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={"/favicon.svg"}
                                                    alt="Pherus logo"
                                                    className="size-4.5"
                                                />
                                                <p>{item.attribution}</p>
                                            </div>
                                        </div>

                                        <div className='pt-10'>
                                            <Link to='/' className="flex text-sm items-center gap-2">
                                                Read more
                                                <HugeiconsIcon icon={ArrowRight01Icon} className='size-3.5' />
                                            </Link>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </section>
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
                        "w-full"
                    )}
                >
                    <video
                        src={
                            "https://www.gstatic.com/marketing-cms/65/90/187a660941b497fe2d7d782f7ef4/headphone-bot-desktop-xl-2x-av1.mp4"
                        }
                        autoPlay
                        muted
                        loop
                        className="h-fit! w-45! mx-auto!"
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
                        {[
                            {
                                label: "Discussions",
                                to: "/discussions",
                                img: "/favicon.svg",
                                description:
                                    "Ask questions, share ideas, and help others.",
                            },
                            {
                                label: "GitHub",
                                to: "/github",
                                img: "/favicon.svg",
                                description:
                                    "Join one of our GitHub organizations.",
                            },
                            {
                                label: "Bug reporting",
                                to: "/bug-reporting",
                                img: "/favicon.svg",
                                description:
                                    "See an issue? Let us know.",
                            },
                        ].map((item, idx) => {
                            return (
                                <article
                                    key={idx}
                                    className={cn(
                                        "flex flex-col p-3 rounded-2xl shadow",
                                        "hover:shadow-md gap-1 cursor-pointer",
                                        "gap-3 border border-border/35 bg-input"
                                    )}
                                >
                                    <img
                                        src={item.img}
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
                            )
                        })}
                    </div>
                </section>
            </div>
        </article>
    )
}
