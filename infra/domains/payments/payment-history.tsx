import { useMemo } from "react"
import type { FC } from "react"
import { Badge } from "@infra/ui/components/badge"
import { DataTable } from "@infra/ui/widgets/tables"
import type { DataTableColumnDef } from "@infra/ui/widgets/tables"
import type { ListedPayment } from "@/kit/payments"
import { formatUtc } from "@infra/ui/lib/date"
import { statusVariant } from "./status-variant"

export type PaymentHistoryProps = {
    payments: ListedPayment[]
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
                cell: ({ row }) => (
                    <Badge variant={statusVariant(row.original.status)}>
                        {row.original.status}
                    </Badge>
                ),
            },
            {
                accessorKey: "createdAt",
                header: "Date",
                cell: ({ row }) => formatUtc(row.original.createdAt, "PPp"),
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
