import { useState } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { usersQueryOptions, useUsers, useSetUserRole, useRemoveUser } from "@/kit/users"
import { isAdminTier, isOwner as isOwnerRole } from "@/auth/utils/permissions"
import { Button } from "@infra/ui/components/ui/button"
import { ListUsers, CreateUser, GetUserDetail } from "@/features/users"

export const Route = createFileRoute("/_workspace/users")({
    beforeLoad: ({ context: { user } }) => {
        if (!isAdminTier(user.role ?? "")) {
            throw redirect({
                to: "/unauthorized",
                replace: true
            })
        }
    },
    loader: async ({ context: { q } }) => {
        await q.ensureQueryData(usersQueryOptions())
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { user } = Route.useRouteContext()
    const currentUserId = user.id
    const currentUserRole = user.role ?? ""

    const { data: usersData } = useUsers()
    const isOwner = isOwnerRole(currentUserRole)
    const { mutateAsync: setUserRole } = useSetUserRole()
    const { mutateAsync: removeUser } = useRemoveUser()

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [viewUserId, setViewUserId] = useState<string | null>(null)

    return (
        <article className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-3xl">
            <section className="flex items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl md:text-4xl">Users</h1>
                        <Button size="sm" type="button" onClick={() => setDrawerOpen(true)}>
                            Add user
                        </Button>
                    </div>
                    <p className="text-muted-foreground">
                        Everyone with an account on this instance.
                        {!isOwner && " Only an owner can change roles or remove another owner."}
                    </p>
                </div>
            </section>

            <ListUsers
                users={usersData.users}
                currentUserId={currentUserId}
                isOwner={isOwner}
                onView={setViewUserId}
                onSetRole={(userId, role) => void setUserRole({ data: { userId, role } })}
                onRemove={(userId) => void removeUser({ data: { userId } })}
            />

            <CreateUser open={drawerOpen} onOpenChange={setDrawerOpen} isOwner={isOwner} />

            <GetUserDetail
                userId={viewUserId}
                onClose={() => setViewUserId(null)}
                currentUserId={currentUserId}
                isOwner={isOwner}
            />
        </article>
    )
}
