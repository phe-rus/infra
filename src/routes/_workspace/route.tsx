import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { isAdminTier } from '@/auth/permissions'
import { Dashboard } from '@/components/dashboard'

// root's own session fetch (see authFn.ts's getSession) is deliberately
// non-throwing, since it runs for every route including /sign-in and
// /setup, so this is where "you need a session, and it needs to be
// owner or admin" actually gets enforced for the dashboard specifically.
// The plain "user" role is never allowed in here, full stop, it's not a
// configurable instance setting.
export const Route = createFileRoute('/_workspace')({
  beforeLoad: ({ context: { session } }) => {
    if (!session) throw redirect({
      to: '/sign-in',
      replace: true,
      search: { reason: 'session-expired' }
    })

    if (!isAdminTier(session.user.role ?? '')) {
      throw redirect({ to: '/unauthorized', replace: true })
    }

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
