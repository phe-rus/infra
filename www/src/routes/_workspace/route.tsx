import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard'

export const Route = createFileRoute('/_workspace')({
  loader: ({ context: { session } }) => {
    if (!session) {
      throw redirect({
        to: '/sign-in',
        replace: true,
        search: {
          redirect: '/'
        }
      })
    }
    return { session: session }
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
