import { type FC, useMemo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, type DataTableColumnDef } from "@/components/widgets/tables"
import { isAdminTier, isOwner as isOwnerRole } from "@/auth/utils/permissions"
import type { ListedUser } from "@/kit/users"
import { IconDotsVertical } from "@tabler/icons-react"
import { format } from "date-fns/format"
import { cn } from "@/lib/utils"

export type ListUsersProps = {
    users: ListedUser[]
    currentUserId: string
    isOwner: boolean
    onView: (userId: string) => void
    onSetRole: (userId: string, role: "owner" | "admin" | "user") => void
    onRemove: (userId: string) => void
}

export const ListUsers: FC<ListUsersProps> = ({
    users,
    currentUserId,
    isOwner,
    onView,
    onSetRole,
    onRemove,
}) => {
    const columns = useMemo((): DataTableColumnDef<ListedUser>[] => [
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
                        onClick={() => onView(id)}
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
                const isSelf = rowUser.id === currentUserId
                const canManageRole = isOwner && !isSelf
                const canRemove = !isSelf && (isOwner || !isOwnerRole(role))

                return (
                    <DropdownMenuTrigger>
                        <Button type="button" variant="ghost" size="icon-xs" aria-label="Row actions">
                            <IconDotsVertical className="size-4" />
                        </Button>
                        <DropdownMenu aria-label="Row actions">
                            <DropdownMenuItem onAction={() => onView(rowUser.id)}>View</DropdownMenuItem>

                            {canManageRole && (
                                <>
                                    <DropdownMenuSeparator />
                                    {!isAdminTier(role) && (
                                        <DropdownMenuItem onAction={() => onSetRole(rowUser.id, "admin")}>
                                            Make admin
                                        </DropdownMenuItem>
                                    )}
                                    {role === "admin" && (
                                        <>
                                            <DropdownMenuItem onAction={() => onSetRole(rowUser.id, "owner")}>
                                                Make owner
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onAction={() => onSetRole(rowUser.id, "user")}>
                                                Demote to user
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    {isOwnerRole(role) && (
                                        <DropdownMenuItem onAction={() => onSetRole(rowUser.id, "admin")}>
                                            Demote to admin
                                        </DropdownMenuItem>
                                    )}
                                </>
                            )}
                            {canRemove && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive" onAction={() => onRemove(rowUser.id)}>
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
        [currentUserId, isOwner, onView, onSetRole, onRemove]
    )

    return (
        <DataTable
            aria-label="Users"
            columns={columns}
            data={users}
            getRowId={(row) => row.id}
            emptyMessage="No members yet."
            searchPlaceholder="Search by name or email…"
            bulkActions={(selectedRows, clearSelection) => (
                <Button
                    type="button"
                    variant="destructive"
                    size="xs"
                    onClick={() => {
                        selectedRows
                            .filter((row) => row.id !== currentUserId && (isOwner || !isOwnerRole(row.role ?? "user")))
                            .forEach((row) => onRemove(row.id))
                        clearSelection()
                    }}
                >
                    Remove selected
                </Button>
            )}
        />
    )
}
