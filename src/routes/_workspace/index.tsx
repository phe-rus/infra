import { createFileRoute, Link } from "@tanstack/react-router"
import { IconInfoCircle } from '@tabler/icons-react'
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { statsQueryOptions } from "@/kit/hypermedia/stats"
import { applicationsQueryOptions } from "@/kit/hypermedia/applications"
import { BusinessStats, ApplicationGrid } from "@/features/dashboard"

export const Route = createFileRoute("/_workspace/")({
  loader: async ({ context: { q } }) => {
    await Promise.all([
      q.ensureQueryData(statsQueryOptions()),
      q.ensureQueryData(applicationsQueryOptions()),
    ])
  },
  component: RouteComponent
})

function RouteComponent() {
  return (
    <article className={cn(
      "container flex flex-col w-full md:max-w-3xl mx-auto",
      'py-20 gap-5'
    )}>
      <section>
        <h1 className='text-3xl md:text-4xl'>Good morning, Pherus</h1>
        <p>Here&apos;s what&apos;s happening with pherus</p>
      </section>

      <section className='bg-card rounded-2xl'>
        <div className='flex items-center gap-3 p-3'>
          <IconInfoCircle />
          <h2 className='text-sm flex items-center gap-1'>
            Your code and connections all look good
            <a className='cursor-pointer hover:underline'>View status page</a>
          </h2>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Your business</h2>
        <BusinessStats />
      </section>

      <section className="flex flex-col gap-3">
        <div className='flex items-center justify-between'>
          <h2>Your applications</h2>
          <Link to="/database" className={cn(buttonVariants({ size: 'sm' }))}>
            Add application
          </Link>
        </div>
        <ApplicationGrid />
      </section>

      <section className='bg-card rounded-2xl'>
        <div className='flex flex-col p-10'>
          <h1>Refer a friend and get started</h1>
          <p>The Kinde Referral Program lets you earn rewards for customers you refer to Kinde</p>
          <div className='mt-5 ml-auto'>
            <Button>
              Learn more
            </Button>
            <Button>
              Share referral link
            </Button>
          </div>
        </div>
      </section>
    </article>
  )
}
