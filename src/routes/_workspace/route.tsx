import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Dashboard } from '@/components/dashboard'

// session presence and role-allowed are both already enforced by AuthMiddleware
// inside root's getSession() call (see __root.tsx's beforeLoad and
// middleware/auth-middleware.ts), so by the time this runs `session` is
// guaranteed to be a session belonging to an allowed role. Nothing left to
// check here beyond handing it down as `user`.
export const Route = createFileRoute('/_workspace')({
  beforeLoad: ({ context: { session } }) => {
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
