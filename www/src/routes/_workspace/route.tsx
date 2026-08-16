import { createFileRoute, Outlet } from '@tanstack/react-router'
import { currentOptions } from '@/functions/get-auth'

export const Route = createFileRoute('/_workspace')({
  loader: async ({ context }) => {
    await context.q.ensureQueryData(currentOptions())
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
