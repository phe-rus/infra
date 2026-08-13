import { type FC, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, type DataTableColumnDef } from "@/components/widgets/tables"
import type { ListedApplication } from "@/kit/types"
import { IconDotsVertical } from "@tabler/icons-react"
import { format } from "date-fns/format"
import { cn } from "@/lib/utils"

export type ListApplicationsProps = {
    applications: ListedApplication[]
    onView: (applicationId: string) => void
    onSetActive: (applicationId: string, active: boolean) => void
    onRotate: (applicationId: string) => void
    onRemove: (applicationId: string) => void
}

function logoUrl(logoKey: string): string {
    return `/api/auth/objects/download?key=${encodeURIComponent(logoKey)}`
}

const STATUS_COLOR: Record<string, string> = {
    verified: "bg-green-500",
    unverified: "bg-red-500",
    locked: "bg-amber-500",
}

export const ListApplications: FC<ListApplicationsProps> = ({
    applications,
    onView,
    onSetActive,
    onRotate,
    onRemove,
}) => {
    const columns = useMemo(
        (): DataTableColumnDef<ListedApplication>[] => [
            {
                accessorKey: "name",
                header: "Application",
                cell: ({ row }) => (
                    <div
                        className={cn("flex items-center gap-2 cursor-pointer")}
                        onClick={() => onView(row.original.id)}
                    >
                        <Avatar size="sm">
                            {row.original.logoKey && <AvatarImage src={logoUrl(row.original.logoKey)} alt="" />}
                            <AvatarFallback>{row.original.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{row.original.name}</span>
                    </div>
                ),
            },
            {
                accessorKey: "identifier",
                header: "Identifier",
                cell: ({ row }) => <code className="text-xs">{row.original.identifier}</code>,
            },
            {
                accessorKey: "type",
                header: "Type",
                cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => (
                    <span className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", STATUS_COLOR[row.original.status])} />
                        {row.original.status}
                    </span>
                ),
            },
            {
                accessorKey: "active",
                header: "Active",
                cell: ({ row }) =>
                    row.original.active ? (
                        <Badge variant="outline">Active</Badge>
                    ) : (
                        <Badge variant="destructive">Disabled</Badge>
                    ),
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
                    const app = row.original
                    return (
                        <DropdownMenuTrigger>
                            <Button type="button" variant="ghost" size="icon-xs" aria-label="Row actions">
                                <IconDotsVertical className="size-4" />
                            </Button>
                            <DropdownMenu aria-label="Row actions">
                                <DropdownMenuItem onAction={() => onView(app.id)}>View</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onAction={() => onSetActive(app.id, !app.active)}>
                                    {app.active ? "Disable" : "Enable"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onAction={() => onRotate(app.id)}>Rotate secret</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onAction={() => onRemove(app.id)}>
                                    Remove
                                </DropdownMenuItem>
                            </DropdownMenu>
                        </DropdownMenuTrigger>
                    )
                },
            },
        ],
        [onView, onSetActive, onRotate, onRemove]
    )

    return (
        <DataTable
            aria-label="Applications"
            columns={columns}
            data={applications}
            getRowId={(row) => row.id}
            emptyMessage="No applications yet."
            searchPlaceholder="Search by name…"
        />
    )
}
