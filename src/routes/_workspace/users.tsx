import { createFileRoute, redirect } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { usersQueryOptions } from "@/functions/usersFn"
import { customRolesQueryOptions } from "@/functions/rolesFn"
import { useCreateUser, useRemoveUser, useSetUserRole } from "@/hooks/usersHooks"
import { DrawerClose } from "@/components/ui/drawer"
import { DialogWidget } from "@/components/widgets/dialog-widget"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/widgets/tables"
import { UserDetailDrawer, getUsersColumns } from "@/components/dashboard/users"
import { FIXED_ROLE_NAMES } from "@/auth/permissions"
import { useState } from "react"

export const Route = createFileRoute("/_workspace/users")({
    beforeLoad: ({ context: { user } }) => {
        if (user.role !== "owner" && user.role !== "admin") {
            throw redirect({ to: "/unauthorized", replace: true })
        }
    },
    loader: async ({ context: { q } }) => {
        await Promise.all([
            q.ensureQueryData(usersQueryOptions()),
            q.ensureQueryData(customRolesQueryOptions()),
        ])
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { user } = Route.useRouteContext()
    const { data: usersData } = useSuspenseQuery(usersQueryOptions())
    const { data: customRoles } = useSuspenseQuery(customRolesQueryOptions())
    const isOwner = user.role === "owner"

    const { mutateAsync: createUser } = useCreateUser()
    const { mutateAsync: setUserRole } = useSetUserRole()
    const { mutateAsync: removeUser } = useRemoveUser()

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [viewUserId, setViewUserId] = useState<string | null>(null)
    const [draftName, setDraftName] = useState("")
    const [draftEmail, setDraftEmail] = useState("")
    const [draftPassword, setDraftPassword] = useState("")
    const [draftRole, setDraftRole] = useState("user")

    const assignableRoles = [...FIXED_ROLE_NAMES, ...customRoles.map((role) => role.name)]

    async function handleAddUser() {
        await createUser({
            data: {
                name: draftName.trim(),
                email: draftEmail.trim(),
                password: draftPassword,
                role: isOwner ? draftRole : "user",
            },
        })
        setDraftName("")
        setDraftEmail("")
        setDraftPassword("")
        setDraftRole("user")
        setDrawerOpen(false)
    }

    const columns = getUsersColumns({
        currentUserId: user.id,
        isOwner,
        onView: (userId) => setViewUserId(userId),
        onSetRole: (userId, role) => void setUserRole({ data: { userId, role } }),
        onRemove: (userId) => void removeUser({ data: { userId } }),
    })

    return (
        <article className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-2xl">
            <section className="flex items-center justify-between gap-3">
                <div>
                    <div className='flex items-center gap-2'>
                        <h1 className="text-3xl md:text-4xl">Users</h1>
                        <Button size='sm' type="button" onClick={() => setDrawerOpen(true)}>
                            Add user
                        </Button>
                    </div>
                    <p className="text-muted-foreground">
                        Everyone with an account on this instance.
                        {!isOwner && " Only an owner can change roles or remove a member."}
                    </p>
                </div>
            </section>

            <DataTable
                columns={columns}
                data={usersData.users}
                emptyMessage="No members yet."
                searchPlaceholder="Search by name or email…"
                bulkActions={
                    isOwner
                        ? (selectedRows, clearSelection) => (
                              <Button
                                  type="button"
                                  variant="destructive"
                                  size="xs"
                                  onClick={() => {
                                      selectedRows
                                          .filter((row) => row.id !== user.id)
                                          .forEach((row) => void removeUser({ data: { userId: row.id } }))
                                      clearSelection()
                                  }}
                              >
                                  Remove selected
                              </Button>
                          )
                        : undefined
                }
            />

            <DialogWidget
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                title="Add a user"
                description={
                    isOwner
                        ? "Create an account directly with any role."
                        : "New users are added with the user role."
                }
                footer={
                    <>
                        <Button
                            type="button"
                            isDisabled={!draftName.trim() || !draftEmail.trim() || draftPassword.length < 8}
                            onClick={() => void handleAddUser()}
                        >
                            Add user
                        </Button>
                        <DrawerClose render={<Button type="button" variant="outline" />}>Cancel</DrawerClose>
                    </>
                }
            >
                <FieldGroup className="grid grid-cols-1 gap-3">
                    <Field>
                        <FieldLabel htmlFor="new-user-name">Name</FieldLabel>
                        <Input
                            id="new-user-name"
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="new-user-email">Email</FieldLabel>
                        <Input
                            id="new-user-email"
                            type="email"
                            value={draftEmail}
                            onChange={(e) => setDraftEmail(e.target.value)}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="new-user-password">Password</FieldLabel>
                        <Input
                            id="new-user-password"
                            type="password"
                            value={draftPassword}
                            onChange={(e) => setDraftPassword(e.target.value)}
                        />
                    </Field>
                    {isOwner && (
                        <Field>
                            <FieldLabel htmlFor="new-user-role">Role</FieldLabel>
                            <Select
                                id="new-user-role"
                                selectedKey={draftRole}
                                onSelectionChange={(key) => setDraftRole(String(key))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignableRoles.map((role) => (
                                        <SelectItem key={role} id={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    )}
                </FieldGroup>
            </DialogWidget>

            <UserDetailDrawer
                userId={viewUserId}
                onClose={() => setViewUserId(null)}
                isOwner={isOwner}
                currentUserId={user.id}
            />
        </article>
    )
}
