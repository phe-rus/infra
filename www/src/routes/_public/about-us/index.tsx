import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useMemo } from 'react'

export const Route = createFileRoute('/_public/about-us/')({
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

  return (
    <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
      <section className="container flex flex-col gap-5">
        <div className="mx-auto flex w-full md:max-w-3xl flex-col">
          <motion.h1 {...reveal} className="font-black">
            About us
          </motion.h1>

          <motion.p {...reveal} className="md:max-w-md text-base">
            We are a collective of like-minded individuals driven by
            curiosity and a desire to understand, improve, and
            innovate.
          </motion.p>
        </div>

        <section className="container flex flex-col gap-5">

        </section>
      </section>
    </article>
  )
}
