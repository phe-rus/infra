import { Footers } from '@/components/footers'
import { Toolbars } from '@/components/toolbars'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_public')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Toolbars />
      <Outlet />
      <Footers />
    </>
  )
}
