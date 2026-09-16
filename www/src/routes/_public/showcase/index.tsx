import { cn } from '@infra/ui/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useMemo } from 'react'

export const Route = createFileRoute('/_public/showcase/')({
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

  const showcasing = useMemo(() => {
    return [
      {
        title: 'Pass',
        description: (
          <>
            A personal identity system built on the idea of
            owning your identity. Its a decentralised system
            that allows you to control your own identity.
            It is built using modern web technologies and follows
            open standards.
          </>
        ),
        tags: ['Identity', 'Decentralised', 'Open standards'],
        stack: ['bun', 'React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
        catalogs: [
          'Infra',
          'Accounts'
        ],
        img: '/og.png'
      },
      {
        title: 'Health',
        description: (
          <>
            A personal health system built on the idea of
            owning your health. Its a decentralised system
            that allows you to control your own health.
            It is built using modern web technologies and follows
            open standards.
          </>
        ),
        tags: ['Identity', 'Decentralised', 'Open standards'],
        stack: ['bun', 'React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
        img: '/og.png'
      },
      {
        title: 'Collective',
        description: (
          <>
            A system built on the idea of shared ownership.
            Its a decentralised system that allows you to
            build and create systems together.
          </>
        ),
        tags: ['Organisation', 'Decentralised', 'Collective action'],
        stack: ['bun', 'React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
        img: '/og.png'
      },
      {
        title: 'Research',
        description: (
          <>
            Research and exploration into various fields.
            This is where we document our findings and share them with the
            world.
          </>
        ),
        tags: ['Research', 'Exploration', 'Science'],
        stack: ['Zettelkasten', 'Roam', 'Personal Knowledge Management'],
        img: '/og.png'
      }
    ]
  }, [])


  return (
    <article className="flex flex-col gap-5 pt-10 pb-32 md:gap-10">
      <section className="container flex flex-col gap-5">
        <div className="mx-auto flex w-full md:max-w-3xl flex-col">
          <motion.h1 {...reveal} className="font-black">
            A detailed overview into the work we have
            accomplished or are currently working on.
          </motion.h1>

          <motion.p {...reveal} className="md:max-w-md text-base">
            The work we do at Pherus touches many
            different fields, from identity and access
            management to health and legal technology.
          </motion.p>
        </div>

        <section className="container flex flex-col gap-5">
          <div className="mx-auto flex w-full md:max-w-3xl flex-col">
            <motion.h3 {...reveal} className="font-black">
              Showcase
            </motion.h3>
          </div>

          <div className={cn(
            'columns-2 md:columns-3 gap-2 mx-auto w-full',
            'md:max-w-3xl'
          )}>
            {showcasing?.map((item, i) => (
              <motion.article
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
                className={cn(
                  "group flex flex-col overflow-hidden cursor-pointer",
                  "break-inside-avoid! mb-5",
                )}
              >
                <div className="mt-auto relative w-full aspect-video p-px">
                  <div className='relative w-full h-full overflow-hidden rounded-none!'>
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
                <div className="flex flex-col w-full py-1">
                  <span className="text-xs! font-medium text-muted-foreground">
                    {item.tags.map((tag) => `#${tag}`).join(', ')}
                  </span>
                  <span className="text-xs! font-medium text-muted-foreground">
                    {item.stack.map((tag) => `#${tag}`).join(', ')}
                  </span>
                  <h1 className="text-base!">{item.title}</h1>
                  <p className='text-sm!'>{item.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </section>
    </article>
  )
}
