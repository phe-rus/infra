import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/legal/cookie-policy')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/legal/cookie-policy"!</div>
}
