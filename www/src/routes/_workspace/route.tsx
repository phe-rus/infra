import { Footers } from '@/components/footers'
import { Headers } from '@/components/headers'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Headers />
      <Outlet />
      <Footers />
    </>
  )
}
