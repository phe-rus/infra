import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { allowedRolesQueryOptions } from '@/hooks/rolesHooks'
import { isRoleAllowed } from '@/auth/permissions'
import { Dashboard } from '@/components/dashboard'

// root's own session fetch (see authFn.ts's getSession) is deliberately
// non-throwing, since it runs for every route including /sign-in and
// /setup, so this is where "you need a session, and it needs to be an
// allowed role" actually gets enforced for the dashboard specifically.
export const Route = createFileRoute('/_workspace')({
  beforeLoad: async ({ context: { session, q } }) => {
    if (!session) throw redirect({
      to: '/sign-in',
      replace: true,
      search: { reason: 'session-expired' }
    })

    const allowedRoles = await q.ensureQueryData(allowedRolesQueryOptions())
    if (!isRoleAllowed(session.user.role ?? '', allowedRoles)) {
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
