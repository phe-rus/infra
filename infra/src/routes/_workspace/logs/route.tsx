import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace/logs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
