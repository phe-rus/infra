import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_workspace/")({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <article className={cn(
      "container flex flex-col w-full md:max-w-2xl mx-auto",
      'py-5'
    )}>
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <h1 className="font-medium">Project ready!</h1>
        <p>You may now add components and start building.</p>
        <p>We&apos;ve already added the button component for you.</p>
        <Button className="mt-2">Button</Button>
      </div>
    </article>
  )
}
