import type { ReactTable, RowData } from "@tanstack/react-table"
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from "@tabler/icons-react"
import { Button } from "../../components/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/select"
import type { DataTableFeatures } from "./data-table"

type DataTablePaginationProps<TData extends RowData> = {
    table: ReactTable<DataTableFeatures, TData>
    pageSizeOptions?: number[]
}

export function DataTablePagination<TData extends RowData>({
    table,
    pageSizeOptions = [10, 20, 30, 50],
}: DataTablePaginationProps<TData>) {
    const { pageIndex, pageSize } = table.state.pagination
    const pageCount = table.getPageCount()

    return (
        <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground">
                Page {pageCount ? pageIndex + 1 : 0} of {pageCount}
            </p>

            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    isDisabled={!table.getCanPreviousPage()}
                    onClick={() => table.setPageIndex(0)}
                >
                    <IconChevronsLeft />
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    isDisabled={!table.getCanPreviousPage()}
                    onClick={() => table.previousPage()}
                >
                    <IconChevronLeft />
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    isDisabled={!table.getCanNextPage()}
                    onClick={() => table.nextPage()}
                >
                    <IconChevronRight />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    isDisabled={!table.getCanNextPage()}
                    onClick={() => table.setPageIndex(pageCount - 1)}
                >
                    <IconChevronsRight />
                </Button>
            </div>

            <Select
                aria-label="Rows per page"
                selectedKey={String(pageSize)}
                onSelectionChange={(key) => table.setPageSize(Number(key))}
            >
                <SelectTrigger size="sm" className="w-16">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {pageSizeOptions.map((size) => (
                        <SelectItem key={size} id={String(size)}>
                            {size}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
