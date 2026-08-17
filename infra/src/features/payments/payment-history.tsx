import { type FC, useMemo } from "react"
import { Badge } from "@infra/ui/components/badge"
import { DataTable, type DataTableColumnDef } from "@infra/ui/widgets/tables"
import type { ListedPayment } from "@/kit/payments"
import { format } from "date-fns/format"

export type PaymentHistoryProps = {
    payments: ListedPayment[]
}

function statusVariant(status: string): "outline" | "destructive" | "secondary" {
    if (status === "completed") return "outline"
    if (status === "failed" || status === "cancelled") return "destructive"
    return "secondary"
}

export const PaymentHistory: FC<PaymentHistoryProps> = ({ payments }) => {
    const columns = useMemo(
        (): DataTableColumnDef<ListedPayment>[] => [
            {
                accessorKey: "type",
                header: "Type",
                cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
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
                accessorKey: "createdAt",
                header: "Date",
                cell: ({ row }) => format(row.original.createdAt, "PPp"),
            },
        ],
        []
    )

    return (
        <DataTable
            aria-label="Payment history"
            columns={columns}
            data={payments}
            getRowId={(row) => row.id}
            emptyMessage="No payments yet."
            searchPlaceholder="Search…"
        />
    )
}
