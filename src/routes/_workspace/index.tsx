import { createFileRoute } from "@tanstack/react-router"
import { IconInfoCircle } from '@tabler/icons-react'
import { cn } from "@/lib/utils"
import { Button, LinkButton } from "@/components/ui/button"

export const Route = createFileRoute("/_workspace/")({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <article className={cn(
      "container flex flex-col w-full md:max-w-2xl mx-auto",
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
        <article className='flex items-center gap-5 p-5 rounded-2xl bg-card'>
          <div className='flex items-center justify-evenly gap-5 w-full mx-auto'>
            <div>
              <h3>Monthly active users</h3>
              <p>Last 30 days</p>
              <h1>0</h1>
            </div>
            <span className="bg-border w-px h-16" />
            <div>
              <h3>Total users</h3>
              <p>Current</p>
              <h1>0</h1>
            </div>
          </div>
        </article>
      </section>

      <section>
        <div className='flex items-center justify-between'>
          <h2>Your applications</h2>
          <LinkButton>
            Add application
          </LinkButton>
        </div>
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
