import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/r')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
