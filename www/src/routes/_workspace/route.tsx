import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Headers } from '@/features/headers'

export const Route = createFileRoute('/_workspace')({
  loader: ({ context: { session } }) => {
    if (!session) {
      throw redirect({
        to: '/sign-in',
        replace: true
      })
    }
    return { session: session }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Headers />
      <Outlet />
    </>
  )
}
