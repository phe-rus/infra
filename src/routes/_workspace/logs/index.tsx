import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace/logs/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <article className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-3xl">
      <section>
        <h1 className="text-3xl md:text-4xl">Logs</h1>
        <p className="text-muted-foreground">Everything happened, eventually.</p>
      </section>
    </article>
  )
}
