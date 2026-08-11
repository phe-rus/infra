import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { allowedRolesQueryOptions } from '@/functions/rolesFn'
import { isRoleAllowed } from '@/auth/permissions'
import { Dashboard } from '@/components/dashboard'

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
