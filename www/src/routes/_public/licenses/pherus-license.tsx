import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/licenses/pherus-license')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/licenses/pherus-license"!</div>
}
