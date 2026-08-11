import { createFileRoute, redirect } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { customRolesQueryOptions } from "@/hooks/rolesHooks"
import {
    useBanUser,
    useCreateUser,
    useImpersonateUser,
    useRemoveUser,
    useRevokeUserSession,
    useRevokeUserSessions,
    useSetUserPassword,
    useSetUserRole,
    useUnbanUser,
    useUserDetail,
    usersQueryOptions,
} from "@/hooks/usersHooks"
import { DrawerClose } from "@/components/ui/drawer"
import { DialogWidget } from "@/components/widgets/dialog-widget"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, type DataTableColumnDef } from "@/components/widgets/tables"
import { FIXED_ROLE_NAMES, isAdminTier, isOwner as isOwnerRole } from "@/auth/permissions"
import { type ListedUser } from "@/types"
import { IconDotsVertical } from "@tabler/icons-react"
import { format } from "date-fns/format"
import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"

const BAN_DURATIONS = [
    { id: "permanent", label: "Permanent", seconds: undefined },
    { id: "86400", label: "1 day", seconds: 60 * 60 * 24 },
    { id: "604800", label: "7 days", seconds: 60 * 60 * 24 * 7 },
    { id: "2592000", label: "30 days", seconds: 60 * 60 * 24 * 30 },
] as const

export const Route = createFileRoute("/_workspace/users")({
    beforeLoad: ({ context: { user } }) => {
        if (!isAdminTier(user.role ?? "")) {
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
    const isOwner = isOwnerRole(user.role ?? "")

    const { mutateAsync: createUser } = useCreateUser()
    const { mutateAsync: setUserRole } = useSetUserRole()
    const { mutateAsync: removeUser } = useRemoveUser()

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [draftName, setDraftName] = useState("")
    const [draftEmail, setDraftEmail] = useState("")
    const [draftPassword, setDraftPassword] = useState("")
    const [draftRole, setDraftRole] = useState("user")

    const [viewUserId, setViewUserId] = useState<string | null>(null)
    const { data: viewUser, isLoading: viewUserLoading } = useUserDetail(viewUserId)
    const { mutateAsync: banUser } = useBanUser()
    const { mutateAsync: unbanUser } = useUnbanUser()
    const { mutateAsync: revokeSession } = useRevokeUserSession()
    const { mutateAsync: revokeSessions } = useRevokeUserSessions()
    const { mutateAsync: setPassword } = useSetUserPassword()
    const { mutateAsync: impersonateUser } = useImpersonateUser()
    const [banReason, setBanReason] = useState("")
    const [banDuration, setBanDuration] = useState<string>("permanent")
    const [newPassword, setNewPassword] = useState("")
    const isViewingSelf = viewUserId === user.id

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

    async function handleBan() {
        if (!viewUserId) return
        const duration = BAN_DURATIONS.find((d) => d.id === banDuration)
        await banUser({
            data: { userId: viewUserId, banReason: banReason.trim() || undefined, banExpiresIn: duration?.seconds },
        })
        setBanReason("")
        setBanDuration("permanent")
    }

    async function handleSetPassword() {
        if (!viewUserId) return
        await setPassword({ data: { userId: viewUserId, newPassword } })
        setNewPassword("")
    }

    const columns = useMemo(
        (): DataTableColumnDef<ListedUser>[] => [
            {
                id: "select",
                enableColumnFilter: false,
                enableGlobalFilter: false,
                header: ({ table }) => (
                    <Checkbox
                        slot={null}
                        isSelected={table.getIsAllPageRowsSelected()}
                        isIndeterminate={
                            table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
                        }
                        onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        slot={null}
                        isSelected={row.getIsSelected()}
                        onChange={(checked) => row.toggleSelected(checked)}
                        aria-label="Select row"
                    />
                ),
            },
            {
                accessorKey: "id",
                header: "ID",
                cell: ({ row }) => {
                    const id = row.original.id
                    return (
                        <span
                            className={cn("bg-accent rounded px-3 py-1 text-xs!", "cursor-pointer")}
                            onClick={() => setViewUserId(id)}
                        >
                            {id}
                        </span>
                    )
                },
            },
            {
                accessorKey: "name",
                header: "Name",
            },
            {
                accessorKey: "email",
                header: "Email",
            },
            {
                accessorKey: "role",
                header: "Role",
                cell: ({ row }) => {
                    const role = row.original.role ?? "user"
                    return <Badge variant={role === "user" ? "outline" : "secondary"}>{role}</Badge>
                },
            },
            {
                accessorKey: "banned",
                header: "Status",
                cell: ({ row }) =>
                    row.original.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                    ) : (
                        <Badge variant="outline">Active</Badge>
                    ),
            },
            {
                accessorKey: "updatedAt",
                header: "Updated",
                cell: ({ row }) => format(row.original.updatedAt, "PPP"),
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                cell: ({ row }) => format(row.original.createdAt, "PPP"),
            },
            {
                id: "actions",
                header: "",
                enableColumnFilter: false,
                enableGlobalFilter: false,
                enableSorting: false,
                cell: ({ row }) => {
                    const rowUser = row.original
                    const role = rowUser.role ?? "user"
                    const isSelf = rowUser.id === user.id
                    const canManageRole = isOwner && !isSelf

                    return (
                        <DropdownMenuTrigger>
                            <Button type="button" variant="ghost" size="icon-xs" aria-label="Row actions">
                                <IconDotsVertical className="size-4" />
                            </Button>
                            <DropdownMenu aria-label="Row actions">
                                <DropdownMenuItem onAction={() => setViewUserId(rowUser.id)}>
                                    View
                                </DropdownMenuItem>

                                {canManageRole && (
                                    <>
                                        <DropdownMenuSeparator />
                                        {!isAdminTier(role) && (
                                            <DropdownMenuItem
                                                onAction={() =>
                                                    void setUserRole({ data: { userId: rowUser.id, role: "admin" } })
                                                }
                                            >
                                                Make admin
                                            </DropdownMenuItem>
                                        )}
                                        {role === "admin" && (
                                            <>
                                                <DropdownMenuItem
                                                    onAction={() =>
                                                        void setUserRole({
                                                            data: { userId: rowUser.id, role: "owner" },
                                                        })
                                                    }
                                                >
                                                    Make owner
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onAction={() =>
                                                        void setUserRole({
                                                            data: { userId: rowUser.id, role: "user" },
                                                        })
                                                    }
                                                >
                                                    Demote to user
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        {isOwnerRole(role) && (
                                            <DropdownMenuItem
                                                onAction={() =>
                                                    void setUserRole({ data: { userId: rowUser.id, role: "admin" } })
                                                }
                                            >
                                                Demote to admin
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onAction={() => void removeUser({ data: { userId: rowUser.id } })}
                                        >
                                            Remove
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenu>
                        </DropdownMenuTrigger>
                    )
                },
            },
        ],
        []
    )

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
                aria-label="Users"
                columns={columns}
                data={usersData.users}
                getRowId={(row) => row.id}
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
                            autoComplete="new-password"
                            value={draftPassword}
                            onChange={(e) => setDraftPassword(e.target.value)}
                        />
                    </Field>
                    {isOwner && (
                        <Field>
                            <FieldLabel htmlFor="new-user-role">Role</FieldLabel>
                            <Select
                                id="new-user-role"
                                aria-label="Role"
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

            <DialogWidget
                open={Boolean(viewUserId)}
                onOpenChange={(open) => !open && setViewUserId(null)}
                title={viewUser?.user.name ?? "User"}
                description={viewUser?.user.email}
                footer={<DrawerClose render={<Button type="button" variant="outline" />}>Close</DrawerClose>}
            >
                {viewUserLoading && <p className="text-xs text-muted-foreground">Loading…</p>}

                {viewUser && (
                    <>
                        <section className="flex flex-wrap gap-2">
                            <Badge variant={viewUser.user.role === "user" ? "outline" : "secondary"}>
                                {viewUser.user.role ?? "user"}
                            </Badge>
                            <Badge variant={viewUser.user.emailVerified ? "outline" : "secondary"}>
                                {viewUser.user.emailVerified ? "Verified" : "Unverified"}
                            </Badge>
                            <Badge variant={viewUser.user.banned ? "destructive" : "outline"}>
                                {viewUser.user.banned ? "Banned" : "Active"}
                            </Badge>
                        </section>

                        <section className="flex flex-col gap-1 text-xs text-muted-foreground">
                            <div>
                                ID: <code className="text-foreground">{viewUser.user.id}</code>
                            </div>
                            <div>Created {format(viewUser.user.createdAt, "PPPp")}</div>
                            <div>Updated {format(viewUser.user.updatedAt, "PPPp")}</div>
                        </section>

                        {isOwner && !isViewingSelf && (
                            <>
                                <Separator />
                                <section className="flex flex-col gap-2">
                                    <h3 className="text-sm font-medium">Ban</h3>
                                    {viewUser.user.banned ? (
                                        <>
                                            {viewUser.user.banReason && (
                                                <p className="text-xs text-muted-foreground">
                                                    Reason: {viewUser.user.banReason}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {viewUser.user.banExpires
                                                    ? `Expires ${format(viewUser.user.banExpires, "PPPp")}`
                                                    : "Never expires"}
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => void unbanUser({ data: { userId: viewUser.user.id } })}
                                            >
                                                Unban
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Field>
                                                <FieldLabel htmlFor="ban-reason">Reason</FieldLabel>
                                                <Input
                                                    id="ban-reason"
                                                    value={banReason}
                                                    onChange={(e) => setBanReason(e.target.value)}
                                                    placeholder="Optional"
                                                />
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="ban-duration">Duration</FieldLabel>
                                                <Select
                                                    id="ban-duration"
                                                    aria-label="Duration"
                                                    selectedKey={banDuration}
                                                    onSelectionChange={(key) => setBanDuration(String(key))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {BAN_DURATIONS.map((d) => (
                                                            <SelectItem key={d.id} id={d.id}>
                                                                {d.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={() => void handleBan()}
                                            >
                                                Ban user
                                            </Button>
                                        </>
                                    )}
                                </section>
                            </>
                        )}

                        <Separator />
                        <section className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Sessions</h3>
                                {isOwner && viewUser.sessions.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="xs"
                                        onClick={() => void revokeSessions({ data: { userId: viewUser.user.id } })}
                                    >
                                        Revoke all
                                    </Button>
                                )}
                            </div>
                            {viewUser.sessions.length === 0 && (
                                <p className="text-xs text-muted-foreground">No active sessions.</p>
                            )}
                            {viewUser.sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between gap-2 border border-input px-2.5 py-1.5 text-xs"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span>{session.userAgent ?? "Unknown device"}</span>
                                        <span className="text-muted-foreground">
                                            {session.ipAddress ?? "Unknown IP"} · expires{" "}
                                            {format(session.expiresAt, "PPP")}
                                        </span>
                                    </div>
                                    {isOwner && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="xs"
                                            onClick={() =>
                                                void revokeSession({ data: { sessionToken: session.token } })
                                            }
                                        >
                                            Revoke
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </section>

                        <Separator />
                        <section className="flex flex-col gap-2">
                            <h3 className="text-sm font-medium">Connected accounts</h3>
                            {viewUser.accounts.length === 0 && (
                                <p className="text-xs text-muted-foreground">No connected accounts.</p>
                            )}
                            {viewUser.accounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="flex items-center justify-between border border-input px-2.5 py-1.5 text-xs"
                                >
                                    <span className="capitalize">{account.providerId}</span>
                                    <span className="text-muted-foreground">
                                        linked {format(account.createdAt, "PPP")}
                                    </span>
                                </div>
                            ))}
                        </section>

                        {isOwner && (
                            <>
                                <Separator />
                                <section className="flex flex-col gap-2">
                                    <h3 className="text-sm font-medium">Set new password</h3>
                                    <Field>
                                        <FieldLabel htmlFor="new-password" className="sr-only">
                                            New password
                                        </FieldLabel>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            autoComplete="new-password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="At least 8 characters"
                                        />
                                    </Field>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        isDisabled={newPassword.length < 8}
                                        onClick={() => void handleSetPassword()}
                                    >
                                        Set password
                                    </Button>
                                </section>
                            </>
                        )}

                        {isOwner && !isViewingSelf && (
                            <>
                                <Separator />
                                <section className="flex flex-col gap-2">
                                    <h3 className="text-sm font-medium">Impersonate</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Sign in as this user. You can return to your own account from anywhere in
                                        the app.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => void impersonateUser({ data: { userId: viewUser.user.id } })}
                                    >
                                        Impersonate
                                    </Button>
                                </section>
                            </>
                        )}
                    </>
                )}
            </DialogWidget>
        </article>
    )
}
