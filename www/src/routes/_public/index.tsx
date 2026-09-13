import { createFileRoute } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"

export const Route = createFileRoute("/_public/")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <AnimatePresence>
            <article className='flex flex-col gap-5'>
                <section className='container flex flex-col justify-center min-h-[55dvh]'>
                    <div className='md:max-w-lg text-center m-auto'>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className='text-5xl md:text-8xl font-black'
                        >
                            Pherus
                        </motion.h1>
                        <motion.picture
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className='mx-auto size-fit block my-5'>
                            <img
                                src="/favicon.svg"
                                alt="Pherus"
                                className="size-32 dark:hidden"
                                data-not-typeset
                            />
                            <img
                                src="/favicon_light.png"
                                alt="Pherus"
                                className="size-32 hidden dark:block"
                                data-not-typeset
                            />
                        </motion.picture>
                        <motion.h2
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className='font-black'
                        >
                            We are collective of like minded individuals{' '}
                            <span className='text-muted-foreground'>
                                driven by curiosity & a drive to innovate.
                            </span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className="text-base"
                        >
                            Let us show you our wildest dreams & imaginations, so you see the world through our eyes.
                        </motion.p>
                        <span className='h-18 w-px my-10 bg-primary mx-auto block' />
                    </div>
                </section>

                <section className='container flex flex-col gap-5'>
                    <div className='flex flex-col w-full md:max-w-3xl mx-auto'>
                        <h1 className='font-black'>Our Works</h1>
                        <p className="text-base md:max-w-md">
                            Here are some of the projects we've worked on. Each one is a testament to our
                            commitment to quality and our passion for innovation.
                        </p>
                    </div>

                    <div className='flex flex-wrap gap-2 w-full md:max-w-3xl mx-auto'>
                        {new Array(5).fill(0).map((_, i) => (
                            <div key={i}>
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + i * 0.1, duration: 0.7 }}
                                >
                                    <div className='rounded-md border-2 p-2'>
                                        <div className='relative'>

                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </section>
            </article>
        </AnimatePresence>
    )
}
