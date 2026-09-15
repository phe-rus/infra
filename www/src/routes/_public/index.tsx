import {
    HeartHandshakeIcon,
    LegalIcon,
    RainbowIcon,
    Science,
    SecurityIcon,
    SoftwareIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@infra/ui/components/tabs"
import { cn } from "@infra/ui/lib/utils"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { useMemo } from "react"

export const Route = createFileRoute("/_public/")({
    component: RouteComponent,
})

function RouteComponent() {
    const reveal = useMemo(() => {
        return {
            initial: { opacity: 0 },
            whileInView: { opacity: 1 },
            viewport: { once: true },
            transition: { delay: 0.3, duration: 0.7 },
        }
    }, [])

    const contribution = useMemo(() => [
        { title: "Pass", to: "/rss/pass", img: "/favicon.svg" },
        { title: "Pherus Health", to: "/rss/health", img: "/favicon.svg" },
        { title: "Pherus collective", to: "/rss/collective", img: "/favicon.svg" },
        { title: "Pherus software", to: "/rss/software", img: "/favicon.svg" },
        { title: "Transspace", to: "/rss/transspace", img: "/favicon.svg" },
        { title: "Laniina", to: "/rss/laniina", img: "/favicon.svg" },
        { title: "Futa", to: "/rss/futa", img: "/favicon.svg" },
        { title: "Sora", to: "/rss/sora", img: "/favicon.svg" },
    ], [])

    const fieldList = useMemo(() => {
        return [
            {
                title: "Identity & access",
                icon: SecurityIcon,
                items: ["Pherus Pass", "Pherus Account", "Authentication"],
                description:
                    "Exploring how people can securely identify, access, and move between the systems they use.",
            },
            {
                title: "Health & wellbeing",
                icon: HeartHandshakeIcon,
                items: ["Pherus Health", "Health research", "Care infrastructure"],
                description:
                    "Building and exploring technology around health, care, and better access to information.",
            },
            {
                title: "Justice & governance",
                icon: LegalIcon,
                items: ["Pleadli", "Legal technology", "Civic systems"],
                description:
                    "Exploring technology and research that can make public institutions and justice systems work better.",
            },
            {
                title: "Queer life & community",
                icon: RainbowIcon,
                items: ["Pherus Transspace", "Q2Q network", "Community resources"],
                description:
                    "Creating spaces, resources, and technology that help people find community, knowledge, and support.",
            },
            {
                title: "Science & research",
                icon: Science,
                items: ["Research", "Experiments", "Scientific projects"],
                description:
                    "Following questions wherever they lead, from practical experiments to deeper scientific inquiry.",
            },
            {
                title: "Software & infrastructure",
                icon: SoftwareIcon,
                items: ["Open source", "Developer tools", "Pherus infrastructure"],
                description:
                    "Building the underlying software, infrastructure, and tools that make the wider ecosystem possible.",
            },
        ]
    }, [])

    const showcasing = useMemo(() => {
        return [
            {
                tab: 'Projects',
                items: [
                    {
                        title: 'Awwwards Hero',
                        description: 'Awwwards nomination and a People\'s Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.',
                        to: '/',
                        img: '/og.png'
                    },
                    {
                        title: 'Awwwards Hero',
                        description: 'Awwwards nomination and a People\'s Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.',
                        to: '/',
                        img: '/og.png'
                    },
                    {
                        title: 'Awwwards Hero',
                        description: 'Awwwards nomination and a People\'s Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.',
                        to: '/',
                        img: '/og.png'
                    }
                ]
            },
            {
                tab: 'Research',
                items: [
                    {
                        title: 'Awwwards Hero',
                        description: 'Awwwards nomination and a People\'s Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.',
                        to: '/',
                        img: '/og.png'
                    },
                    {
                        title: 'Awwwards Hero',
                        description: 'Awwwards nomination and a People\'s Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.',
                        to: '/',
                        img: '/og.png'
                    }
                ]
            },
            {
                tab: 'Redesign',
                items: [
                    {
                        title: 'Awwwards Hero',
                        description: 'Awwwards nomination and a People\'s Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.',
                        to: '/',
                        img: '/og.png'
                    }
                ]
            }
        ]
    }, [])

    return (
        <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
            <section className="container flex min-h-[55dvh] flex-col justify-center">
                <div className="m-auto max-w-lg text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="text-5xl font-black md:text-8xl"
                    >
                        Pherus
                    </motion.h1>

                    <motion.picture
                        {...reveal}
                        className="mx-auto my-5 block size-fit"
                    >
                        <img
                            src="/favicon.svg"
                            alt="Pherus"
                            className="size-32 dark:hidden"
                            data-not-typeset
                        />
                        <img
                            src="/favicon_light.png"
                            alt="Pherus"
                            className="hidden size-32 dark:block"
                            data-not-typeset
                        />
                    </motion.picture>

                    <motion.h2 {...reveal} className="font-black">
                        We are collective of like minded individuals{" "}
                        <span className="text-muted-foreground">
                            driven by curiosity & a drive to innovate.
                        </span>
                    </motion.h2>

                    <motion.p {...reveal} className="text-base">
                        Let us show you our wildest dreams & imaginations, so
                        you see the world through our eyes.
                    </motion.p>

                    <motion.span
                        {...reveal}
                        className="mx-auto my-10 block h-18 w-px bg-primary"
                    />
                </div>
            </section>

            <section className="container flex flex-col gap-5">
                <div className="mx-auto flex w-full max-w-3xl flex-col">
                    <motion.h2 {...reveal} className="font-black">
                        Fields of interest
                    </motion.h2>

                    <motion.p {...reveal} className="max-w-md text-base">
                        Pherus explores a growing range of fields, bringing
                        together research, technology, and practical work
                        wherever curiosity takes us.
                    </motion.p>
                </div>

                <div className="mx-auto flex w-full max-w-3xl flex-wrap gap-2">
                    {fieldList.map(({ title, icon }, i) => (
                        <motion.div
                            key={title}
                            {...reveal}
                            transition={{
                                ...reveal.transition,
                                delay: 0.3 + i * 0.1,
                            }}
                            className={cn(
                                "group cursor-pointer rounded-md border p-1",
                                "bg-muted text-muted-foreground shadow",
                                "hover:shadow-sm",
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={icon} className="size-5" />
                                <p className="text-xs! font-semibold">{title}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section
                className={cn(
                    "container flex min-h-[50dvh] w-full flex-col items-center",
                    "justify-center gap-5",
                )}
            >
                <motion.h2
                    {...reveal}
                    className="mx-auto text-center font-black md:max-w-md"
                >
                    Here's a little more about some of the things we're
                    building.
                </motion.h2>

                <div
                    className="relative w-full max-w-3xl select-none overflow-hidden"
                    style={{
                        maskImage:
                            "linear-gradient(90deg, #0000, #000 10% 90%, #0000)",
                    }}
                >
                    <div className="flex w-max animate-[marquee_20s_linear_infinite]">
                        {[...contribution, ...contribution].map(
                            ({ title, to, img }, i) => (
                                <a
                                    key={`${title}-${i}`}
                                    href={to}
                                    className={cn(
                                        "flex shrink-0 items-center gap-2 pr-12",
                                        "cursor-default opacity-80 transition-opacity",
                                        "hover:opacity-100",
                                    )}
                                >
                                    <img
                                        src={img}
                                        alt={title}
                                        className="size-6 rounded-full"
                                        data-not-typeset
                                    />
                                    <span className="text-base">{title}</span>
                                </a>
                            ),
                        )}
                    </div>
                </div>
            </section>

            <section className='container flex flex-col gap-5'>
                <div className="mx-auto flex w-full max-w-3xl flex-col">
                    <motion.h2 {...reveal} className="text-center font-black">
                        Showcase of our work's
                    </motion.h2>
                </div>

                <div className='flex flex-col md:max-w-3xl w-full mx-auto'>
                    <Tabs defaultValue={showcasing[0].tab} className="flex flex-col gap-5 w-full">
                        <TabsList variant='line' className='mx-auto gap-5'>
                            {showcasing?.map(({ tab }, i) =>
                                <TabsTrigger {...reveal} key={i} value={tab} className='p-0 text-sm'>{tab}</TabsTrigger>
                            )}
                        </TabsList>


                        {showcasing?.map(({ items, tab }, i) =>
                            <TabsContent key={i} value={tab} className='w-full gap-5'>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full'>
                                    {items?.map((item, i) => (
                                        <motion.a
                                            initial={{
                                                opacity: 0,
                                                y: 20,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                delay: i * 0.1,
                                            }}
                                            whileTap={{ scale: 0.99 }}
                                            whileHover={{ scale: 1.01 }}
                                            key={i}
                                            href={item.to}
                                            className={cn(
                                                "group bg-muted overflow-hidden",
                                                "rounded-sm border cursor-pointer shadow",
                                                'hover:-translate-y-1 transition-all duration-500',
                                                "hover:shadow-sm",
                                            )}
                                        >
                                            <div className="flex flex-col text-center w-full p-5">
                                                <h1 className="text-base!">{item.title}</h1>
                                                <p>{item.description}</p>
                                            </div>
                                            <div className="mt-auto relative w-full aspect-video p-px">
                                                <div className='relative w-full h-full overflow-hidden rounded-sm'>
                                                    <img
                                                        src={item.img}
                                                        alt={item.title}
                                                        className={cn(
                                                            'absolute inset-0 w-full h-full object-cover',
                                                            'group-hover:scale-101 transition-transform',
                                                            'duration-700 ease-out transition-opacity',
                                                            'duration-500 opacity-100'
                                                        )}
                                                        data-not-typeset
                                                    />
                                                </div>
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </section>
        </article>
    )
}