import type { PropsWithChildren } from "react"
import type { RowData } from "@tanstack/react-table"
import { IconDotsVertical } from "@tabler/icons-react"
import { Checkbox } from "../../components/checkbox"
import { Button } from "../../components/button"
import { DropdownMenu, DropdownMenuTrigger } from "../../components/dropdown-menu"
import type { DataTableColumnDef } from "./data-table"

type RowActionsMenuProps = PropsWithChildren

export function selectColumn<TData extends RowData>(): DataTableColumnDef<TData> {
    return {
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
    }
}

export function RowActionsMenu({ children }: RowActionsMenuProps) {
    return (
        <DropdownMenuTrigger>
            <Button type="button" variant="ghost" size="icon-xs" aria-label="Row actions">
                <IconDotsVertical className="size-4" />
            </Button>
            <DropdownMenu aria-label="Row actions">{children}</DropdownMenu>
        </DropdownMenuTrigger>
    )
}
