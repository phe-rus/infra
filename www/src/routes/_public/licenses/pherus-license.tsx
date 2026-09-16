import { m } from "@/paraglide/messages"
import { reveal } from "@lib/motion"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

export const Route = createFileRoute(
    "/_public/licenses/pherus-license"
)({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
            <section className="container flex flex-col gap-5">
                <div className="mx-auto flex w-full md:max-w-3xl flex-col">
                    <motion.h1
                        {...reveal}
                        className="font-black"
                    >
                        {m["nav.licenses.pherus-license"]()}
                    </motion.h1>

                    <motion.p
                        {...reveal}
                        className="md:max-w-md text-base"
                    >
                        The Pherus License's actual terms
                        haven't been written yet — this page
                        is a placeholder until real legal text
                        is supplied.
                    </motion.p>
                </div>
            </section>
        </article>
    )
}
