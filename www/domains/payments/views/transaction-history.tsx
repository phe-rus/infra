import { useState } from "react"
import type { FC } from "react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@infra/ui/components/button"
import { Badge } from "@infra/ui/components/badge"
import { Checkbox } from "@infra/ui/components/checkbox"
import { ContentView } from "@infra/ui/widgets/content-view"
import { cn } from "@infra/ui/lib/utils"
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@infra/ui/components/tabs"
import { IconLoader2, IconMail, IconPdf } from "@tabler/icons-react"
import type { MyPaymentsData, PaymentConfigData } from "../func"
import { useResendReceipt, useResendReceipts } from "../use-payments"
import { providerLabel } from "../provider-label"

type TransactionHistoryProps = {
    data: MyPaymentsData
    config: PaymentConfigData
}

type Payment = MyPaymentsData["payments"][number]

const STATUS_VARIANT: Record<string, "secondary" | "destructive"> = {
    pending: "secondary",
    failed: "destructive",
    cancelled: "destructive",
}

function PaymentRow({
    payment,
    config,
    withReceiptActions,
    isSelected,
    onToggle,
    isSending,
    onResend,
}: {
    payment: Payment
    config: PaymentConfigData
    withReceiptActions: boolean
    isSelected?: boolean
    onToggle?: () => void
    isSending?: boolean
    onResend?: () => void
}) {
    return (
        <article
            className={cn(
                "flex items-center justify-between",
                "rounded-md bg-input/35 p-3",
                "group relative overflow-hidden"
            )}
        >
            <div className="flex gap-3">
                {withReceiptActions && (
                    <Checkbox
                        aria-label="Select transaction"
                        isSelected={isSelected}
                        onChange={onToggle}
                        className="mt-1.5 size-3! cursor-pointer"
                    />
                )}
                <div className="flex flex-col">
                    <h3 className="font-semibold">
                        {payment.rail === "dodo"
                            ? "Card"
                            : providerLabel(config.countries, payment.provider)}
                    </h3>
                    <div className="flex items-center gap-2">
                        <p className="line-clamp-1 text-xs text-muted-foreground md:max-w-58">
                            {payment.phoneNumber ??
                                payment.pawapayReferenceId ??
                                payment.dodoReferenceId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(payment.createdAt), {
                                addSuffix: true,
                            })}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1 truncate">
                <p
                    className={cn(
                        "text-xs font-semibold",
                        payment.status === "completed"
                            ? "text-primary"
                            : "text-muted-foreground"
                    )}
                >
                    +{payment.currency} {Number(payment.amount).toLocaleString()}
                </p>
                {payment.status !== "completed" ? (
                    <Badge
                        variant={STATUS_VARIANT[payment.status] ?? "secondary"}
                        className="cursor-pointer rounded-full capitalize"
                    >
                        {payment.status}
                    </Badge>
                ) : (
                    withReceiptActions && (
                        <Button
                            size="icon-xs"
                            variant="secondary"
                            className="ml-auto rounded-full"
                            aria-label="Email receipt"
                            isDisabled={isSending}
                            onClick={onResend}
                        >
                            {isSending ? (
                                <IconLoader2 className="animate-spin" />
                            ) : (
                                <IconPdf />
                            )}
                        </Button>
                    )
                )}
            </div>
        </article>
    )
}

export const TransactionHistory: FC<TransactionHistoryProps> = ({ data, config }) => {
    const [tab, setTab] = useState("receipts")
    const [selected, setSelected] = useState<Set<string>>(new Set())

    const resendMutation = useResendReceipt()
    const resendManyMutation = useResendReceipts()

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const payments = data.payments
    const receipts = payments.filter(
        (payment) => payment.type === "deposit" && payment.status === "completed"
    )

    if (payments.length === 0) {
        return (
            <ContentView.Section className="gap-5">
                <ContentView.Header
                    heading="Transactions & receipts"
                    p="No transactions yet"
                    pClassName="text-sm text-muted-foreground"
                />
            </ContentView.Section>
        )
    }

    return (
        <ContentView.Section className="gap-5">
            <Tabs value={tab} onValueChange={setTab}>
                <ContentView.Header
                    heading="Transactions & receipts"
                    action={
                        tab === "receipts" &&
                        selected.size > 0 && (
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
                        )
                    }
                    actionClassName="justify-between"
                />

                <TabsList variant="line" className="px-0! gap-1!">
                    <TabsTrigger value="receipts" className="text-xs! px-0!">
                        Receipts
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="text-xs! px-0!">
                        Transactions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="receipts" className="flex flex-col gap-1">
                    {receipts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No receipts yet
                        </p>
                    ) : (
                        receipts.map((payment) => (
                            <PaymentRow
                                key={payment.id}
                                payment={payment}
                                config={config}
                                withReceiptActions
                                isSelected={selected.has(payment.id)}
                                onToggle={() => toggle(payment.id)}
                                isSending={
                                    resendMutation.isPending &&
                                    resendMutation.variables === payment.id
                                }
                                onResend={() => resendMutation.mutate(payment.id)}
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="transactions" className="flex flex-col gap-1">
                    {payments.map((payment) => (
                        <PaymentRow
                            key={payment.id}
                            payment={payment}
                            config={config}
                            withReceiptActions={false}
                        />
                    ))}
                </TabsContent>
            </Tabs>
        </ContentView.Section>
    )
}
