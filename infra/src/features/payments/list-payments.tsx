import { type FC, useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { Badge } from "@infra/ui/components/ui/badge"
import { Button } from "@infra/ui/components/ui/button"
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "@infra/ui/components/ui/dropdown-menu"
import { TableCell, TableRow } from "@infra/ui/components/ui/table"
import { DataTable, type DataTableColumnDef } from "@infra/ui/components/widgets/tables"
import type { ListedPayment } from "@/kit/payments"
import { IconDotsVertical } from "@tabler/icons-react"
import { format } from "date-fns/format"
import { cn } from "@infra/ui/lib/utils"
import { Checkbox } from "@infra/ui/components/ui/checkbox"

export type ListPaymentsProps = {
    payments: ListedPayment[]
    onRefund: (payment: ListedPayment) => void
}

function statusVariant(status: string): "outline" | "destructive" | "secondary" {
    if (status === "completed") return "outline"
    if (status === "failed" || status === "cancelled") return "destructive"
    return "secondary"
}

// net total per currency, completed transactions only — deposits add,
// payouts/refunds subtract, since they're money leaving the platform
function computeTotals(payments: ListedPayment[]): { currency: string; amount: number }[] {
    const totals = new Map<string, number>()
    for (const payment of payments) {
        if (payment.status !== "completed") continue
        const sign = payment.type === "payout" || payment.type === "refund" ? -1 : 1
        totals.set(payment.currency, (totals.get(payment.currency) ?? 0) + sign * Number(payment.amount))
    }
    return [...totals.entries()].map(([currency, amount]) => ({ currency, amount }))
}

export const ListPayments: FC<ListPaymentsProps> = ({ payments, onRefund }) => {
    const columns = useMemo(
        (): DataTableColumnDef<ListedPayment>[] => [
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
                cell: ({ row }) => (
                    <Link
                        to="/billing/$paymentId"
                        params={{ paymentId: row.original.id }}
                        className={cn("bg-accent rounded px-3 py-1 text-xs!", "cursor-pointer")}
                    >
                        {row.original.id}
                    </Link>
                ),
            },
            {
                accessorKey: "userName",
                header: "User",
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span>{row.original.userName ?? row.original.userId}</span>
                        {row.original.userEmail && (
                            <span className="text-muted-foreground text-xs">{row.original.userEmail}</span>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "type",
                header: "Type",
                cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
            },
            {
                accessorKey: "provider",
                header: "Provider",
                cell: ({ row }) => row.original.provider ?? "—",
            },
            {
                accessorKey: 'phoneNumber',
                header: "Phone Number",
                cell: ({ row }) => row.original.phoneNumber ?? "—",
            },
            {
                accessorKey: 'currency',
                header: "Currency",
                cell: ({ row }) => row.original.currency ?? "—",
            },
            {
                accessorKey: "amount",
                header: "Amount",
                cell: ({ row }) => (
                    <span>
                        {row.original.amount} {row.original.currency}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>,
            },
            {
                accessorKey: "referenceId",
                header: "Reference",
                cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.referenceId}</span>,
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                cell: ({ row }) => format(row.original.createdAt, "PPp"),
            },
            {
                id: "actions",
                header: "",
                enableColumnFilter: false,
                enableGlobalFilter: false,
                enableSorting: false,
                cell: ({ row }) => {
                    const payment = row.original
                    if (payment.type !== "deposit") return null
                    return (
                        <DropdownMenuTrigger>
                            <Button type="button" variant="ghost" size="icon-xs" aria-label="Row actions">
                                <IconDotsVertical className="size-4" />
                            </Button>
                            <DropdownMenu aria-label="Row actions">
                                <DropdownMenuItem onAction={() => onRefund(payment)}>Refund</DropdownMenuItem>
                            </DropdownMenu>
                        </DropdownMenuTrigger>
                    )
                },
            },
        ],
        [onRefund]
    )

    const totals = useMemo(() => computeTotals(payments), [payments])

    return (
        <DataTable
            aria-label="Payments"
            columns={columns}
            data={payments}
            getRowId={(row) => row.id}
            emptyMessage="No payments yet."
            searchPlaceholder="Search…"
            footer={
                totals.length > 0
                    ? (columnCount) => (
                          <TableRow>
                              <TableCell colSpan={columnCount}>
                                  <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
                                      <span className="text-muted-foreground">Net total (completed only):</span>
                                      {totals.map(({ currency, amount }) => (
                                          <span key={currency} className="font-medium">
                                              {amount.toLocaleString()} {currency}
                                          </span>
                                      ))}
                                  </div>
                              </TableCell>
                          </TableRow>
                      )
                    : undefined
            }
        />
    )
}
