import type { ColumnDef } from "@tanstack/react-table"
import type { ApiKey } from "@/functions/apiKeysFn"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { baseTableFeatures } from "@/components/widgets/tables"
import { format } from "date-fns/format"
import { IconDotsVertical } from "@tabler/icons-react"

type GetApiKeyColumnsOptions = {
    onToggleEnabled?: (keyId: string, enabled: boolean) => void
    onDelete?: (keyId: string) => void
}

export function getApiKeyColumns({
    onToggleEnabled,
    onDelete,
}: GetApiKeyColumnsOptions): ColumnDef<typeof baseTableFeatures, ApiKey, any>[] {
    return [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => row.original.name ?? "Unnamed key",
        },
        {
            id: "prefix",
            header: "Key",
            enableColumnFilter: false,
            enableGlobalFilter: false,
            cell: ({ row }) => (
                <code className="rounded-none bg-input/30 px-2 py-1 text-xs">
                    {(row.original.prefix ?? "") + (row.original.start ?? "")}••••••
                </code>
            ),
        },
        {
            accessorKey: "enabled",
            header: "Status",
            cell: ({ row }) =>
                row.original.enabled ? (
                    <Badge variant="outline">Enabled</Badge>
                ) : (
                    <Badge variant="secondary">Disabled</Badge>
                ),
        },
        {
            accessorKey: "expiresAt",
            header: "Expires",
            enableColumnFilter: false,
            cell: ({ row }) =>
                row.original.expiresAt ? format(row.original.expiresAt, "PPP") : "Never",
        },
        {
            accessorKey: "lastRequest",
            header: "Last used",
            enableColumnFilter: false,
            cell: ({ row }) => (row.original.lastRequest ? format(row.original.lastRequest, "PPP") : "Never"),
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            enableColumnFilter: false,
            cell: ({ row }) => format(row.original.createdAt, "PPP"),
        },
        {
            id: "actions",
            header: "",
            enableColumnFilter: false,
            enableGlobalFilter: false,
            enableSorting: false,
            cell: ({ row }) => {
                const key = row.original
                return (
                    <DropdownMenuTrigger>
                        <Button type="button" variant="ghost" size="icon-xs" aria-label="Key actions">
                            <IconDotsVertical className="size-4" />
                        </Button>
                        <DropdownMenu aria-label="Key actions">
                            <DropdownMenuItem onAction={() => onToggleEnabled?.(key.id, !key.enabled)}>
                                {key.enabled ? "Disable" : "Enable"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onAction={() => onDelete?.(key.id)}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenu>
                    </DropdownMenuTrigger>
                )
            },
        },
    ]
}
