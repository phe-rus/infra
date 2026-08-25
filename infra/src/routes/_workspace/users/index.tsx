import { useUsers, useSetUserRole, useRemoveUser, usersQueryOptions } from "@/domains/users"
import { ListUsers, CreateUser, GetUserDetail } from "@/domains/users"
import { isOwner as isOwnerRole } from "@infra/auth/permissions"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@infra/ui/components/button"
import { ViewController } from "@/components/views"
import { useState } from "react"

export const Route = createFileRoute("/_workspace/users/")({
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
        <ViewController
            heading={
                <ViewController.Heading
                    title="Users"
                    description={
                        <>
                            Everyone with an account on this instance.
                            {!isOwner && " Only an owner can change roles or remove another owner."}
                        </>
                    }
                    action={
                        <Button size="sm" type="button" onClick={() => setDrawerOpen(true)}>
                            Add user
                        </Button>
                    }
                />
            }
        >
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
        </ViewController>
    )
}
