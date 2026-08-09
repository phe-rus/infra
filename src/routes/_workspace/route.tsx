import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Dashboard } from '@/components/dashboard'

export const Route = createFileRoute('/_workspace')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Dashboard>
      <Outlet />
    </Dashboard>
  )
}
