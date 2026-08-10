import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Dashboard } from '@/components/dashboard'

export const Route = createFileRoute('/_workspace')({
  beforeLoad: async ({ context: { session } }) => {
    if (!session) throw redirect({
      to: '/sign-in',
      replace: true,
      search: { reason: 'session-expired' }
    })
    return {
      user: session.user
    }
  },
  component: RouteComponent
})

function RouteComponent() {
  return (
    <Dashboard>
      <Outlet />
    </Dashboard>
  )
}
