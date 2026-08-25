import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { Badge } from "@infra/ui/components/badge"
import { formatUtc } from "@infra/ui/lib/date"
import type { ListedPayment } from "@/domains/payments"
import { statusVariant } from "./status-variant"

type RowProps = {
    label: string
    value: ReactNode
}

type RelatedLinkProps = {
    payment: ListedPayment
}

function Row({ label, value }: RowProps) {
    return (
        <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right">{value}</span>
        </div>
    )
}

function RelatedLink({ payment }: RelatedLinkProps) {
    return (
        <Link
            to="/billing/$paymentId"
            params={{ paymentId: payment.id }}
            className="flex items-center justify-between gap-4 rounded border px-3 py-2 text-sm hover:bg-muted/50"
        >
            <span className="flex flex-col">
                <span>
                    {payment.amount} {payment.currency}
                </span>
                <span className="text-xs text-muted-foreground">
                    {formatUtc(payment.createdAt, "PPp")}
                </span>
            </span>
            <Badge variant={statusVariant(payment.status)}>{payment.status}</Badge>
        </Link>
    )
}

export const Receipt = { Row, RelatedLink }
