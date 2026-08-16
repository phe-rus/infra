import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@infra/ui/components/ui/button"
import { useSuspenseQuery } from "@tanstack/react-query"
import { currentOptions } from "@/functions/get-auth"

export const Route = createFileRoute("/_workspace/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session } = useSuspenseQuery(currentOptions())
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Button>{session?.user.email}</Button>
    </div>
  )
}
