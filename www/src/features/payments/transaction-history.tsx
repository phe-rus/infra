import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@infra/ui/components/button"
import { Badge } from "@infra/ui/components/badge"
import { Checkbox } from "@infra/ui/components/checkbox"
import { cn } from "@infra/ui/lib/utils"
import { IconLoader2, IconMail, IconPdf } from "@tabler/icons-react"
import { useMyPayments, usePaymentConfig } from "@/functions/get-payments"
import { useResendReceipt, useResendReceipts } from "@/functions/use-payments"

function providerLabel(countries: ReturnType<typeof usePaymentConfig>["data"]["countries"], code: string | null) {
    if (!code) return "Payment"
    for (const country of countries) {
        const match = country.providers.find((p) => p.provider === code)
        if (match) return match.displayName
    }
    return code
}

const STATUS_VARIANT: Record<string, "secondary" | "destructive"> = {
    pending: "secondary",
    failed: "destructive",
    cancelled: "destructive",
}

export function TransactionHistory() {
    const { data } = useMyPayments()
    const { data: config } = usePaymentConfig()
    const [selected, setSelected] = useState<Set<string>>(new Set())

    const resendMutation = useResendReceipt()
    const resendManyMutation = useResendReceipts()

    function toggle(id: string) {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const payments = data.payments

    if (payments.length === 0) {
        return (
            <article className="flex flex-col gap-5">
                <h2>Transactions &amp; receipts</h2>
                <p className="text-sm text-muted-foreground">No transactions yet</p>
            </article>
        )
    }

    return (
        <article className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
                <h2>Transactions &amp; receipts</h2>
                {selected.size > 0 && (
                    <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        isDisabled={resendManyMutation.isPending}
                        onClick={() => {
                            resendManyMutation.mutate([...selected], {
                                onSuccess: () => setSelected(new Set()),
                            })
                        }}
                    >
                        {resendManyMutation.isPending ? (
                            <IconLoader2 className="animate-spin" />
                        ) : (
                            <IconMail />
                        )}
                        Email {selected.size} receipt{selected.size > 1 ? "s" : ""}
                    </Button>
                )}
            </div>

            <div className="flex flex-col gap-3">
                {payments.map((payment) => {
                    const canEmail = payment.status === "completed"
                    const isSending = resendMutation.isPending && resendMutation.variables === payment.id

                    return (
                        <article
                            key={payment.id}
                            className={cn(
                                "flex items-center justify-between",
                                "p-5 rounded-md bg-input/35",
                                "group relative overflow-hidden"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {canEmail && (
                                    <Checkbox
                                        aria-label="Select transaction"
                                        isSelected={selected.has(payment.id)}
                                        onChange={() => toggle(payment.id)}
                                    />
                                )}
                                <div className="flex flex-col">
                                    <h3 className="font-semibold">{providerLabel(config.countries, payment.provider)}</h3>
                                    <p className="text-xs text-muted-foreground md:max-w-58 line-clamp-1">
                                        {payment.phoneNumber ?? payment.pawapayReferenceId}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 truncate">
                                <p
                                    className={cn(
                                        "font-semibold text-xs",
                                        payment.status === "completed" ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    +{payment.currency} {Number(payment.amount).toLocaleString()}
                                </p>
                                {payment.status !== "completed" ? (
                                    <Badge variant={STATUS_VARIANT[payment.status] ?? "secondary"} className="rounded-full capitalize">
                                        {payment.status}
                                    </Badge>
                                ) : (
                                    <Button
                                        size="icon-xs"
                                        variant="secondary"
                                        className="rounded-full ml-auto"
                                        aria-label="Email receipt"
                                        isDisabled={isSending}
                                        onClick={() => resendMutation.mutate(payment.id)}
                                    >
                                        {isSending ? <IconLoader2 className="animate-spin" /> : <IconPdf />}
                                    </Button>
                                )}
                            </div>
                        </article>
                    )
                })}
            </div>
        </article>
    )
}
