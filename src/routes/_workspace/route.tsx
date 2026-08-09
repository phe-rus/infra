import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Dashboard } from '@/components/dashboard'
import { getSession } from '@/functions/authFn'

export const Route = createFileRoute('/_workspace')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) throw redirect({ to: '/sign-in' })
    return { user: session.user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Dashboard>
      <Outlet />
    </Dashboard>
  )
}
