import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/legal/legal-notice')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/legal/legal-notice"!</div>
}
