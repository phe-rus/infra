import { useState } from "react"
import { useUsers, useSetUserRole, useRemoveUser } from "@/kit/hypermedia/users"
import { isOwner as isOwnerRole } from "@/auth/permissions"
import { Button } from "@/components/ui/button"
import { ListUsers } from "./list-users"
import { CreateUser } from "./create-user"
import { GetUserDetail } from "./get-user-detail"

export type UsersPageProps = {
    currentUserId: string
    currentUserRole: string
}

export function UsersPage({ currentUserId, currentUserRole }: UsersPageProps) {
    const { data: usersData } = useUsers()
    const isOwner = isOwnerRole(currentUserRole)
    const { mutateAsync: setUserRole } = useSetUserRole()
    const { mutateAsync: removeUser } = useRemoveUser()

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [viewUserId, setViewUserId] = useState<string | null>(null)

    return (
        <article className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-2xl">
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
