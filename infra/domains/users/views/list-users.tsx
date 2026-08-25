import { useMemo } from "react"
import type { FC } from "react"
import { Badge } from "@infra/ui/components/badge"
import { Button } from "@infra/ui/components/button"
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@infra/ui/components/dropdown-menu"
import {
    DataTable,
    RowActionsMenu,
    selectColumn,
} from "@infra/ui/widgets/tables"
import type { DataTableColumnDef } from "@infra/ui/widgets/tables"
import type { ListedUser } from "@/domains/users"
import { formatUtc } from "@infra/ui/lib/date"
import { cn } from "@infra/ui/lib/utils"

export type ListUsersProps = {
    users: ListedUser[]
    currentUserId: string
    onView: (userId: string) => void
    onSetRole: (userId: string, role: "admin" | "user") => void
    onRemove: (userId: string) => void
}

export const ListUsers: FC<ListUsersProps> = ({
    users,
    currentUserId,
    onView,
    onSetRole,
    onRemove,
}) => {
    const columns = useMemo(
        (): DataTableColumnDef<ListedUser>[] => [
            selectColumn(),
            {
                accessorKey: "id",
                header: "ID",
                cell: ({ row }) => {
                    const id = row.original.id
                    return (
                        <span
                            className={cn(
                                "rounded bg-accent px-3 py-1 text-xs!",
                                "cursor-pointer"
                            )}
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
                    return (
                        <Badge
                            variant={role === "user" ? "outline" : "secondary"}
                        >
                            {role}
                        </Badge>
                    )
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
                accessorKey: "twoFactorEnabled",
                header: "2FA",
                cell: ({ row }) =>
                    row.original.twoFactorEnabled ? (
                        <Badge variant="outline">On</Badge>
                    ) : (
                        <Badge variant="secondary">Off</Badge>
                    ),
            },
            {
                accessorKey: "updatedAt",
                header: "Updated",
                cell: ({ row }) => formatUtc(row.original.updatedAt, "PPP"),
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                cell: ({ row }) => formatUtc(row.original.createdAt, "PPP"),
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
                    const canManageRole = !isSelf
                    const canRemove = !isSelf

                    return (
                        <RowActionsMenu>
                            <DropdownMenuItem
                                onAction={() => onView(rowUser.id)}
                            >
                                View
                            </DropdownMenuItem>

                            {canManageRole && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onAction={() =>
                                            onSetRole(
                                                rowUser.id,
                                                role === "admin"
                                                    ? "user"
                                                    : "admin"
                                            )
                                        }
                                    >
                                        {role === "admin"
                                            ? "Demote to user"
                                            : "Make admin"}
                                    </DropdownMenuItem>
                                </>
                            )}
                            {canRemove && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onAction={() => onRemove(rowUser.id)}
                                    >
                                        Remove
                                    </DropdownMenuItem>
                                </>
                            )}
                        </RowActionsMenu>
                    )
                },
            },
        ],
        [currentUserId, onView, onSetRole, onRemove]
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
                            .filter((row) => row.id !== currentUserId)
                            .forEach((row) => {
                                onRemove(row.id)
                            })
                        clearSelection()
                    }}
                >
                    Remove selected
                </Button>
            )}
        />
    )
}
