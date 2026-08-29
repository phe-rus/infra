import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace/faq/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_workspace/faq/"!</div>
}
