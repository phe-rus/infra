import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/licenses/apache-2.0-license')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/licenses/apache-2/0-license"!</div>
}
