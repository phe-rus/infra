import type { ReactNode } from "react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { format } from "date-fns/format"
import { paymentOptions, usePayment } from "@/kit/payments"
import type { ListedPayment } from "@/kit/payments"
import { Badge } from "@infra/ui/components/badge"
import { Button, buttonVariants } from "@infra/ui/components/button"
import { Separator } from "@infra/ui/components/separator"
import { cn } from "@infra/ui/lib/utils"

export const Route = createFileRoute("/_workspace/billing/$paymentId")({
    loader: async ({ context: { q }, params }) => {
        const detail = await q.ensureQueryData(paymentOptions(params.paymentId))
        if (!detail) throw notFound()
    },
    component: RouteComponent,
})

function statusVariant(status: string): "outline" | "destructive" | "secondary" {
    if (status === "completed") return "outline"
    if (status === "failed" || status === "cancelled") return "destructive"
    return "secondary"
}

function parseFailureReason(value: string | null): { failureCode: string; failureMessage: string } | null {
    if (!value) return null
    try {
        return JSON.parse(value)
    } catch {
        return null
    }
}

function Row({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right">{value}</span>
        </div>
    )
}

function RelatedPaymentLink({ payment }: { payment: ListedPayment }) {
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
                <span className="text-muted-foreground text-xs">{format(payment.createdAt, "PPp")}</span>
            </span>
            <Badge variant={statusVariant(payment.status)}>{payment.status}</Badge>
        </Link>
    )
}

function RouteComponent() {
    const { paymentId } = Route.useParams()
    const { data } = usePayment(paymentId)
    if (!data) return null

    const { payment, relatedDeposit, refunds } = data
    const failureReason = parseFailureReason(payment.failureReason)

    return (
        <article className="container mx-auto flex w-full flex-col gap-5 py-20 print:py-4 md:max-w-2xl">
            <section className="flex items-center justify-between gap-2">
                <div>
                    <Link to="/billing" className="text-muted-foreground text-xs hover:underline print:hidden">
                        ← Back to Billing
                    </Link>
                    <h1 className="text-3xl md:text-4xl">Receipt</h1>
                </div>
                <Button type="button" variant="outline" size="sm" className="print:hidden" onClick={() => window.print()}>
                    Print
                </Button>
            </section>

            <section className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <p className="text-2xl font-medium">
                        {payment.amount} {payment.currency}
                    </p>
                    <p className="text-muted-foreground text-xs">{payment.referenceId}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline">{payment.type}</Badge>
                    <Badge variant={statusVariant(payment.status)}>{payment.status}</Badge>
                </div>
            </section>

            {failureReason && (
                <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                    <p className="font-medium text-destructive">{failureReason.failureCode}</p>
                    <p className="text-muted-foreground">{failureReason.failureMessage}</p>
                </section>
            )}

            <section className="flex flex-col rounded-lg border p-4">
                <Row label="User" value={payment.userName ?? payment.userId} />
                {payment.userEmail && <Row label="Email" value={payment.userEmail} />}
                <Separator className="my-1" />
                {payment.provider && <Row label="Provider" value={payment.provider} />}
                {payment.phoneNumber && <Row label="Phone number" value={payment.phoneNumber} />}
                <Row label="Currency" value={payment.currency} />
                <Separator className="my-1" />
                <Row label="Created" value={format(payment.createdAt, "PPPp")} />
                <Row label="Updated" value={format(payment.updatedAt, "PPPp")} />
            </section>

            {relatedDeposit && (
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-medium">Refunds this deposit</h2>
                    <RelatedPaymentLink payment={relatedDeposit} />
                </section>
            )}

            {refunds.length > 0 && (
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-medium">Refunds against this deposit</h2>
                    <div className="flex flex-col gap-2">
                        {refunds.map((refund) => (
                            <RelatedPaymentLink key={refund.id} payment={refund} />
                        ))}
                    </div>
                </section>
            )}

            <Link to="/billing" className={cn(buttonVariants({ variant: "outline" }), "w-fit print:hidden")}>
                Back to Billing
            </Link>
        </article>
    )
}
