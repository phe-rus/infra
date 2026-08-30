import { useMemo } from "react"
import type { FC } from "react"
import { Link } from "@tanstack/react-router"
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
import { CLIENT_TYPE_INFO } from "@/domains/console"
import type { ClientType, ListedApp } from "@/domains/console"
import { formatUtc } from "@infra/ui/lib/date"
import { cn } from "@infra/ui/lib/utils"

export type ListApplicationsProps = {
    applications: ListedApp[]
    onSetActive: (clientId: string, active: boolean) => void
    onRotate: (clientId: string) => void
    onRemove: (clientId: string) => void
}

export const ListApplications: FC<ListApplicationsProps> = ({
    applications,
    onSetActive,
    onRotate,
    onRemove,
}) => {
    const columns = useMemo(
        (): DataTableColumnDef<ListedApp>[] => [
            selectColumn(),
            {
                accessorKey: "id",
                header: "ID",
                cell: ({ row }) => (
                    <Link
                        to="/console/$client_id"
                        params={{ client_id: row.original.clientId }}
                        className={cn(
                            "rounded bg-accent px-3 py-1 text-xs!",
                            "cursor-pointer"
                        )}
                    >
                        {row.original.id}
                    </Link>
                ),
            },
            {
                accessorKey: "clientId",
                header: "Client ID",
                cell: ({ row }) => <span>{row.original.clientId}</span>,
            },
            {
                accessorKey: "name",
                header: "Application",
                cell: ({ row }) => (
                    <span>{row.original.name ?? "Untitled"}</span>
                ),
            },
            {
                accessorKey: "applicationType",
                header: "Type",
                cell: ({ row }) => {
                    // real data isn't guaranteed to match the ClientType union
                    // (older rows, migrations) even though the type asserts it
                    // does — CLIENT_TYPE_INFO[...] can genuinely be undefined
                    const info = CLIENT_TYPE_INFO[
                        row.original.applicationType as ClientType
                    ] as { label: string; description: string } | undefined
                    return (
                        <Badge variant="outline">
                            {info?.label ?? row.original.applicationType}
                        </Badge>
                    )
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
                cell: ({ row }) =>
                    row.original.createdAt
                        ? formatUtc(row.original.createdAt, "PPP")
                        : "—",
            },
            {
                accessorKey: "updatedAt",
                header: "Updated",
                cell: ({ row }) =>
                    row.original.updatedAt
                        ? formatUtc(row.original.updatedAt, "PPP")
                        : "—",
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
                        <RowActionsMenu>
                            <DropdownMenuItem
                                onSelect={() =>
                                    onSetActive(
                                        app.clientId,
                                        Boolean(app.disabled)
                                    )
                                }
                            >
                                {app.disabled ? "Enable" : "Disable"}
                            </DropdownMenuItem>
                            {app.isOwnClient && (
                                <DropdownMenuItem
                                    onSelect={() => onRotate(app.clientId)}
                                >
                                    Rotate secret
                                </DropdownMenuItem>
                            )}
                            {app.isOwnClient && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={() => onRemove(app.clientId)}
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
                        selectedRows
                            .filter((row) => row.isOwnClient)
                            .forEach((row) => {
                                onRemove(row.clientId)
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
