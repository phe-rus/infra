import {
    useUsers,
    useSetUserRole,
    useRemoveUser,
    usersOptions,
} from "@/domains/users"
import { ListUsers, CreateUser, GetUserDetail } from "@/domains/users"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@infra/ui/components/button"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { useState } from "react"

export const Route = createFileRoute("/_workspace/users/")({
    loader: async ({ context: { q } }) => {
        await q.ensureQueryData(usersOptions())
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { user } = Route.useRouteContext()
    const currentUserId = user.id

    const { data: usersData } = useUsers()
    const { mutateAsync: setUserRole } = useSetUserRole()
    const { mutateAsync: removeUser } = useRemoveUser()

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [viewUserId, setViewUserId] = useState<string | null>(null)

    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title="Users"
                    description="Everyone with an account on this instance."
                    action={
                        <Button
                            size="sm"
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                        >
                            Add user
                        </Button>
                    }
                />
            }
        >
            <ListUsers
                users={usersData.users}
                currentUserId={currentUserId}
                onView={setViewUserId}
                onSetRole={(userId, role) =>
                    void setUserRole({ data: { userId, role } })
                }
                onRemove={(userId) => void removeUser({ data: { userId } })}
            />

            <CreateUser open={drawerOpen} onOpenChange={setDrawerOpen} />

            <GetUserDetail
                userId={viewUserId}
                onClose={() => setViewUserId(null)}
                currentUserId={currentUserId}
            />
        </ViewController>
    )
}
