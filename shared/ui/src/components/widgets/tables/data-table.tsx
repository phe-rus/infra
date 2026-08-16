import {
    columnFilteringFeature,
    columnVisibilityFeature,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    filterFn_arrIncludes,
    filterFn_arrIncludesSome,
    filterFn_equals,
    filterFn_inDateRange,
    filterFn_inNumberRange,
    filterFn_includesString,
    flexRender,
    globalFilteringFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    sortFn_datetime,
    sortFn_text,
    tableFeatures,
    useTable,
    type Column,
    type ColumnDef,
    type ColumnFiltersState,
    type ColumnVisibilityState,
    type RowData,
    type RowSelectionState,
    type SortingState,
} from "@tanstack/react-table"
import { IconChevronDown, IconChevronUp, IconSearch, IconX } from "@tabler/icons-react"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../../ui/table"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../ui/input-group"
import { Checkbox } from "../../ui/checkbox"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { cn } from "../../../lib/utils"
import { useMemo, useState, type ReactNode } from "react"
import { DataTablePagination } from "./pagination"

// only the individual filter/sort functions this table actually resolves by
// name (`filterFn: 'auto'`/`sortFn: 'auto'`, the per-column default) — the
// full `filterFns`/`sortFns` aggregates are deprecated precisely because
// registering them opts every built-in function into the bundle
export const baseTableFeatures = tableFeatures({
    globalFilteringFeature,
    columnFilteringFeature,
    rowSortingFeature,
    rowPaginationFeature,
    columnVisibilityFeature,
    rowSelectionFeature,
    filteredRowModel: createFilteredRowModel(),
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    filterFns: {
        includesString: filterFn_includesString,
        inNumberRange: filterFn_inNumberRange,
        equals: filterFn_equals,
        arrIncludes: filterFn_arrIncludes,
        arrIncludesSome: filterFn_arrIncludesSome,
        inDateRange: filterFn_inDateRange,
    },
    sortFns: {
        text: sortFn_text,
        alphanumeric: sortFn_alphanumeric,
        datetime: sortFn_datetime,
    },
})

export type DataTableFeatures = typeof baseTableFeatures

/**
 * `filterVariant: 'date'` is the one thing a caller has to opt into
 * explicitly (`updatedAt`/`createdAt`, or a custom `type: 'date'` column):
 * unlike an array-valued column (detected automatically below, from the
 * actual data), a date is just a string or number at runtime, nothing to
 * sniff it from safely.
 */
export type DataTableColumnMeta = {
    filterVariant?: "date"
}

export type DataTableColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<
    DataTableFeatures,
    TData,
    TValue
> & { meta?: DataTableColumnMeta }

type DataTableProps<TData extends RowData> = {
    data: TData[]
    columns: DataTableColumnDef<TData, any>[]
    /**
     * A stable id per row, used as the React key and by react-table's row
     * model. Without this, react-table falls back to the row's array index,
     * so deleting a row shifts every id below it onto a different row's
     * data, reusing DOM nodes (and any open dropdown/overlay state) across
     * what are now different rows. Required, not defaulted, so this can't
     * silently regress.
     */
    getRowId: (row: TData) => string
    /** Accessible name for the table landmark — react-aria's grid requires one. */
    "aria-label": string
    emptyMessage?: ReactNode
    searchPlaceholder?: string
    bulkActions?: (selectedRows: TData[], clearSelection: () => void) => ReactNode
    /** Set false to render just the table. Default true. */
    pagination?: boolean
    pageSizeOptions?: number[]
    onSelectedRowsChange?: (rows: TData[]) => void
    /** A summary row rendered inside the table's own <tfoot>, below the data rows — e.g. a totals line. Gets the visible column count for its colSpan. */
    footer?: (columnCount: number) => ReactNode
}

/** Whether any row actually holds an array for this column, checked against real data rather than requiring a caller to declare it. */
function isArrayValuedColumn<TData>(data: TData[], colId: string): boolean {
    return data.some((row) => Array.isArray((row as Record<string, unknown>)[colId]))
}

/**
 * The quick-filter checkbox list's own candidate values. For a plain scalar
 * column, one value per distinct cell. For an array-valued column, the
 * individual items across every row's array are what should show up as
 * checkboxes.
 */
function useQuickFilterValues<TData>(
    data: TData[],
    colId: string,
    exclude: string[],
    isArrayColumn: boolean
) {
    return useMemo(() => {
        if (exclude.includes(colId)) return []
        if (isArrayColumn) {
            const flattened = data.flatMap((row) => {
                const value = (row as Record<string, unknown>)[colId]
                return Array.isArray(value) ? value : []
            })
            const unique = [...new Set(flattened.filter((v) => v !== null && v !== undefined && v !== ""))]
            if (unique.length < 2 || unique.length > 20) return []
            return unique.map((v) => String(v))
        }
        const raw = data.map((row) => (row as Record<string, unknown>)[colId])
        const unique = [
            ...new Set(raw.filter((v) => v !== null && v !== undefined && v !== "" && typeof v !== "object")),
        ]
        if (unique.length < 2 || unique.length > 12) return []
        return unique.map((v) => String(v))
    }, [data, colId, exclude, isArrayColumn])
}

function columnIdOf<TData extends RowData>(col: DataTableColumnDef<TData>): string | undefined {
    if ("id" in col && col.id) return col.id
    if ("accessorKey" in col && typeof col.accessorKey === "string") return col.accessorKey
    return undefined
}

function getColumnLabel(column: { columnDef: { header?: unknown }; id: string }) {
    const header = column.columnDef.header
    if (typeof header === "string") return header
    return column.id.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
}

/**
 * Self-contained table: pass `data` + `columns`, get sorting, pagination,
 * search, column visibility, per-column filters, and row selection for
 * free. There's no `useTable` state to wire up on the caller's side.
 */
export function DataTable<TData extends RowData>({
    data,
    columns,
    getRowId,
    emptyMessage = "No results.",
    searchPlaceholder = "Search…",
    bulkActions,
    pagination = true,
    pageSizeOptions,
    onSelectedRowsChange,
    footer,
    "aria-label": ariaLabel,
}: DataTableProps<TData>) {
    const [globalFilter, setGlobalFilter] = useState("")
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({})
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [columnsOpen, setColumnsOpen] = useState(false)
    const [filtersOpen, setFiltersOpen] = useState(false)

    // A caller's own explicit `filterFn` always wins. Otherwise: a column
    // marked `meta.filterVariant: 'date'` gets real date-range matching; a
    // column whose actual data is array-valued gets array-contains matching
    // — the default `includesString` behavior would otherwise stringify the
    // whole array and only work by accident for a single-item array.
    const augmentedColumns = useMemo(
        () =>
            columns.map((col) => {
                if (col.filterFn) return col
                const colId = columnIdOf(col)
                if (!colId) return col
                if (col.meta?.filterVariant === "date") {
                    return { ...col, filterFn: filterFn_inDateRange }
                }
                if (isArrayValuedColumn(data, colId)) {
                    return { ...col, filterFn: filterFn_arrIncludesSome }
                }
                return col
            }),
        [columns, data]
    )

    const table = useTable({
        features: baseTableFeatures,
        data,
        columns: augmentedColumns,
        getRowId,
        enableRowSelection: true,
        state: { globalFilter, sorting, columnFilters, columnVisibility, rowSelection },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        globalFilterFn: "auto",
    })

    const toggleableColumns = table.getAllColumns().filter((c) => c.getCanHide())
    const hiddenCount = toggleableColumns.filter((c) => !c.getIsVisible()).length

    const skip = ["select", "actions"]
    const filterableColumns = table
        .getAllColumns()
        .filter((c) => c.getCanFilter() && !skip.includes(c.id) && c.accessorFn !== undefined)

    const activeFilterCount = columnFilters.length
    const selectedCount = Object.values(rowSelection).filter(Boolean).length
    const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original)
    const clearSelection = () => setRowSelection({})

    const rows = table.getRowModel().rows
    const columnCount = table.getVisibleLeafColumns().length

    return (
        <div className="flex flex-col gap-3 [&_div]:no-scrollbar [&_tr]:border-none!">
            <div className="relative flex items-center">
                <InputGroup className="max-w-full">
                    <InputGroupInput
                        placeholder={searchPlaceholder}
                        autoComplete="off"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                    <InputGroupAddon align="inline-start">
                        <IconSearch />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        <Button
                            type="button"
                            size="xs"
                            variant={columnsOpen ? "default" : "secondary"}
                            onClick={() => {
                                setColumnsOpen((o) => !o)
                                setFiltersOpen(false)
                            }}
                        >
                            Columns
                            {hiddenCount > 0 && (
                                <Badge variant="destructive" className="ml-0.5 size-4 p-0 text-[9px] tabular-nums">
                                    {hiddenCount}
                                </Badge>
                            )}
                            <IconChevronDown
                                className={cn("transition-transform duration-150", columnsOpen && "rotate-180")}
                            />
                        </Button>
                        <Button
                            type="button"
                            size="xs"
                            variant={activeFilterCount > 0 || filtersOpen ? "default" : "secondary"}
                            onClick={() => {
                                setFiltersOpen((o) => !o)
                                setColumnsOpen(false)
                            }}
                        >
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge variant="destructive" className="ml-0.5 size-4 p-0 text-[9px] tabular-nums">
                                    {activeFilterCount}
                                </Badge>
                            )}
                            <IconChevronDown
                                className={cn("transition-transform duration-150", filtersOpen && "rotate-180")}
                            />
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            </div>

            {columnsOpen && (
                <div className="flex flex-col gap-2 border border-dashed border-input/30 bg-input/15 p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs">Columns</h3>
                        {hiddenCount > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => table.resetColumnVisibility()}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Show all
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        {toggleableColumns.map((column) => {
                            const visible = column.getIsVisible()
                            return (
                                <div
                                    key={column.id}
                                    className="flex cursor-pointer items-center gap-2"
                                    onClick={() => column.toggleVisibility()}
                                >
                                    <Checkbox
                                        aria-label={getColumnLabel(column)}
                                        isSelected={visible}
                                        onChange={() => column.toggleVisibility()}
                                    />
                                    <span className="text-xs">{getColumnLabel(column)}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {filtersOpen && (
                <div className="flex flex-col gap-2 border border-dashed border-input/30 bg-input/15 p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs">Filters</h3>
                        {activeFilterCount > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => setColumnFilters([])}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <IconX className="size-3" />
                                Clear all
                            </Button>
                        )}
                    </div>
                    {filterableColumns.length === 0 ? (
                        <p className="text-xs text-muted-foreground/60">No filterable columns.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {filterableColumns.map((column) => (
                                <FilterRow
                                    key={column.id}
                                    column={column}
                                    data={data}
                                    skip={skip}
                                    isArrayColumn={isArrayValuedColumn(data, column.id)}
                                    isDateColumn={
                                        (column.columnDef as { meta?: DataTableColumnMeta }).meta
                                            ?.filterVariant === "date"
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {bulkActions && selectedCount > 0 && (
                <div className="flex items-center gap-3 border border-dashed border-primary/30 bg-primary/5 px-4 py-2">
                    <span className="text-xs font-medium">{selectedCount} selected</span>
                    <div className="h-4 w-px bg-input/40" />
                    {bulkActions(selectedRows, clearSelection)}
                    <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={clearSelection}
                        className="ml-auto text-muted-foreground hover:text-foreground"
                    >
                        Clear
                    </Button>
                </div>
            )}

            <Table aria-label={ariaLabel} className='divide-none!'>
                <TableHeader>
                    {table.getHeaderGroups().flatMap((headerGroup) => {
                        // react-aria's Table throws unless at least one
                        // Column declares isRowHeader — the first column
                        // that isn't the bulk-select checkbox is the one
                        // that actually identifies the row
                        const rowHeaderId = headerGroup.headers.find((h) => h.column.id !== "select")?.id
                        return headerGroup.headers.map((header) => (
                            <TableHead key={header.id} isRowHeader={header.id === rowHeaderId}>
                                {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                    <div
                                        className="flex w-fit cursor-pointer items-center gap-1 text-muted-foreground hover:text-foreground"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        <div className="flex flex-col">
                                            <IconChevronUp
                                                className={cn(
                                                    "size-3 opacity-20",
                                                    header.column.getIsSorted() === "asc" && "opacity-100"
                                                )}
                                            />
                                            <IconChevronDown
                                                className={cn(
                                                    "-mt-1.5 size-3 opacity-20",
                                                    header.column.getIsSorted() === "desc" && "opacity-100"
                                                )}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    flexRender(header.column.columnDef.header, header.getContext())
                                )}
                            </TableHead>
                        ))
                    })}
                </TableHeader>
                <TableBody>
                    {rows.length ? (
                        rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() ? "selected" : undefined}
                                onClick={() => {
                                    if (!onSelectedRowsChange) return
                                    row.toggleSelected()
                                    onSelectedRowsChange(selectedRows)
                                }}
                            >
                                {row.getAllCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columnCount} className="h-24 text-center">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                {footer && <TableFooter>{footer(columnCount)}</TableFooter>}
            </Table>

            {pagination && <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />}
        </div>
    )
}

function FilterRow<TData extends RowData>({
    column,
    data,
    skip,
    isArrayColumn,
    isDateColumn,
}: {
    column: Column<DataTableFeatures, TData, unknown>
    data: TData[]
    skip: string[]
    isArrayColumn: boolean
    isDateColumn: boolean
}) {
    const uniqueValues = useQuickFilterValues(data, column.id, skip, isArrayColumn)
    const label = getColumnLabel(column)

    // A date column never gets the enumerated-values treatment below —
    // every row realistically has its own distinct timestamp — a from/to
    // range is what's actually useful.
    if (isDateColumn) {
        const [from, to] = (column.getFilterValue() as [string?, string?] | undefined) ?? []
        return (
            <div className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-[11px] font-medium text-muted-foreground">{label}</span>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={from ?? ""}
                        onChange={(e) => column.setFilterValue([e.target.value || undefined, to])}
                        className="h-7 rounded-none border border-dashed border-input/40 bg-background px-2 text-xs outline-none"
                    />
                    <span className="text-[11px] text-muted-foreground">to</span>
                    <input
                        type="date"
                        value={to ?? ""}
                        onChange={(e) => column.setFilterValue([from, e.target.value || undefined])}
                        className="h-7 rounded-none border border-dashed border-input/40 bg-background px-2 text-xs outline-none"
                    />
                    {(from || to) && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => column.setFilterValue(undefined)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <IconX className="size-3" />
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    // `activeFilter` is a bare value for a plain scalar column, or a
    // one-element array for an array-valued column (array-contains matching
    // needs an array of values to check for overlap, even when only one is
    // ever picked here).
    const activeFilter = column.getFilterValue() as string | string[] | undefined
    const activeValue = isArrayColumn
        ? Array.isArray(activeFilter)
            ? activeFilter[0]
            : undefined
        : (activeFilter as string | undefined)

    if (uniqueValues.length > 0) {
        return (
            <div className="flex flex-col gap-1">
                <span className="text-xs">{label}</span>
                <div className="flex flex-wrap items-center gap-3">
                    {uniqueValues.map((value) => {
                        const active = activeValue === value
                        const setActive = () =>
                            column.setFilterValue(active ? undefined : isArrayColumn ? [value] : value)
                        return (
                            <div key={value} className="flex cursor-pointer items-center gap-2" onClick={setActive}>
                                <Checkbox aria-label={value} isSelected={active} onChange={setActive} />
                                <span className="text-xs">{value}</span>
                            </div>
                        )
                    })}
                    {activeValue && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => column.setFilterValue(undefined)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <IconX className="size-3" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-[11px] font-medium text-muted-foreground capitalize">{label}</span>
            <div className="relative max-w-xs flex-1">
                <input
                    type="text"
                    placeholder={`Filter ${label.toLowerCase()}…`}
                    value={activeValue ?? ""}
                    onChange={(e) =>
                        column.setFilterValue(
                            e.target.value ? (isArrayColumn ? [e.target.value] : e.target.value) : undefined
                        )
                    }
                    className="h-7 w-full rounded-none border border-dashed border-input/40 bg-background px-2.5 text-xs outline-none placeholder:text-muted-foreground/40"
                />
                {activeValue && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => column.setFilterValue(undefined)}
                        className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <IconX className="size-3" />
                    </Button>
                )}
            </div>
        </div>
    )
}
