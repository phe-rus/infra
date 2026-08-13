import { type FC, useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, type DataTableColumnDef } from "@/components/widgets/tables"
import { CLIENT_TYPE_INFO, type ClientType, type ListedApp } from "@/kit/console"
import { IconDotsVertical } from "@tabler/icons-react"
import { format } from "date-fns/format"
import { cn } from "@/lib/utils"

export type ListApplicationsProps = {
    applications: ListedApp[]
    onSetActive: (clientId: string, active: boolean) => void
    onRotate: (clientId: string) => void
    onRemove: (clientId: string) => void
}

export const ListApplications: FC<ListApplicationsProps> = ({ applications, onSetActive, onRotate, onRemove }) => {
    const columns = useMemo(
        (): DataTableColumnDef<ListedApp>[] => [
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
                cell: ({ row }) => <Link
                    to="/console/$client_id"
                    params={{ client_id: row.original.clientId }}
                    className={cn("bg-accent rounded px-3 py-1 text-xs!", "cursor-pointer")}
                >
                    {row.original.id}
                </Link>
            },
            {
                accessorKey: "clientId",
                header: "Client ID",
                cell: ({ row }) => <span>{row.original.clientId}</span>
            },
            {
                accessorKey: "name",
                header: "Application",
                cell: ({ row }) => <span>{row.original.name ?? "Untitled"}</span>
            },
            {
                accessorKey: "type",
                header: "Type",
                cell: ({ row }) => {
                    const info = CLIENT_TYPE_INFO[row.original.type as ClientType]
                    return <Badge variant="outline">{info?.label ?? row.original.type ?? "—"}</Badge>
                },
            },
            {
                accessorKey: "disabled",
                header: "Status",
                cell: ({ row }) =>
                    row.original.disabled ? (
                        <Badge variant="destructive">Disabled</Badge>
                    ) : (
                        <Badge variant="outline">Active</Badge>
                    ),
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                cell: ({ row }) => format(row.original.createdAt, "PPP"),
            },
            {
                accessorKey: "updatedAt",
                header: "Updated",
                cell: ({ row }) => format(row.original.updatedAt, "PPP"),
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
                                <DropdownMenuItem onAction={() => onSetActive(app.clientId, Boolean(app.disabled))}>
                                    {app.disabled ? "Enable" : "Disable"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onAction={() => onRotate(app.clientId)}>
                                    Rotate secret
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onAction={() => onRemove(app.clientId)}>
                                    Remove
                                </DropdownMenuItem>
                            </DropdownMenu>
                        </DropdownMenuTrigger>
                    )
                },
            },
        ],
        [onSetActive, onRotate, onRemove]
    )

    return (
        <DataTable
            aria-label="Applications"
            columns={columns}
            data={applications}
            getRowId={(row) => row.id}
            emptyMessage="No applications yet."
            searchPlaceholder="Search by name…"
            bulkActions={(selectedRows, clearSelection) => (
                <Button
                    type="button"
                    variant="destructive"
                    size="xs"
                    onClick={() => {
                        selectedRows.forEach((row) => onRemove(row.clientId))
                        clearSelection()
                    }}
                >
                    Remove selected
                </Button>
            )}
        />
    )
}
