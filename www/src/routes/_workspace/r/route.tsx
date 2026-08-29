import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace/r')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
