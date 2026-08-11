import type { ColumnDef } from "@tanstack/react-table"
import type { ListedUser } from "@/functions/usersFn"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { baseTableFeatures } from "@/components/widgets/tables"
import { format } from 'date-fns/format'
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { IconDotsVertical } from "@tabler/icons-react"

type GetUsersColumnsOptions = {
    currentUserId: string
    isOwner: boolean
    onView?: (userId: string) => void
    onSetRole?: (userId: string, role: string) => void
    onRemove?: (userId: string) => void
}

export function getUsersColumns({
    currentUserId,
    isOwner,
    onView,
    onSetRole,
    onRemove,
}: GetUsersColumnsOptions): ColumnDef<typeof baseTableFeatures, ListedUser, any>[] {
    const columns: ColumnDef<typeof baseTableFeatures, ListedUser, any>[] = [
        {
            id: "select",
            enableColumnFilter: false,
            enableGlobalFilter: false,
            header: ({ table }) => (
                <Checkbox
                    slot={null}
                    isSelected={table.getIsAllPageRowsSelected()}
                    isIndeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
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
                        className={cn(
                            'bg-accent rounded px-3 py-1 text-xs!',
                            'cursor-pointer'
                        )}
                        onClick={() => onView?.(id)}
                    >
                        {id}
                    </span>
                )
            }
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
            accessorKey: 'updatedAt',
            header: "Updated",
            cell: ({ row }) => format(row.original.updatedAt, 'PPP'),
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => format(row.original.createdAt, 'PPP'),
        },
        {
            id: "actions",
            header: "",
            enableColumnFilter: false,
            enableGlobalFilter: false,
            enableSorting: false,
            cell: ({ row }) => {
                const user = row.original
                const role = user.role ?? "user"
                const isSelf = user.id === currentUserId
                const canManageRole = isOwner && !isSelf

                return (
                    <DropdownMenuTrigger>
                        <Button type="button" variant="ghost" size="icon-xs" aria-label="Row actions">
                            <IconDotsVertical className="size-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuItem onAction={() => onView?.(user.id)}>View</DropdownMenuItem>

                            {canManageRole && (
                                <>
                                    <DropdownMenuSeparator />
                                    {role !== "admin" && role !== "owner" && (
                                        <DropdownMenuItem onAction={() => onSetRole?.(user.id, "admin")}>
                                            Make admin
                                        </DropdownMenuItem>
                                    )}
                                    {role === "admin" && (
                                        <>
                                            <DropdownMenuItem onAction={() => onSetRole?.(user.id, "owner")}>
                                                Make owner
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onAction={() => onSetRole?.(user.id, "user")}>
                                                Demote to user
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    {role === "owner" && (
                                        <DropdownMenuItem onAction={() => onSetRole?.(user.id, "admin")}>
                                            Demote to admin
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive" onAction={() => onRemove?.(user.id)}>
                                        Remove
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenu>
                    </DropdownMenuTrigger>
                )
            },
        },
    ]

    return columns
}
