import { useEffect, useState } from "react"
import type { FC } from "react"
import { DrawerClose } from "@infra/ui/components/drawer"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { Field, FieldLabel, FieldGroup } from "@infra/ui/components/field"
import { Input } from "@infra/ui/components/input"
import { Button } from "@infra/ui/components/button"
import { useInitiatePayout, useInitiateRefund } from "@/domains/payments"
import type { ListedPayment } from "@/domains/payments"
import { PaymentFields } from "./payment-fields"
import { usePaymentFields } from "../use-payment-fields"

type PayoutProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type RefundProps = {
    payment: ListedPayment | null
    onOpenChange: (open: boolean) => void
}

const Payout: FC<PayoutProps> = ({ open, onOpenChange }) => {
    const { mutateAsync: initiatePayout, isPending } = useInitiatePayout()
    const fields = usePaymentFields()
    const [amount, setAmount] = useState("")

    const handlePayout = async () => {
        if (!fields.provider) return
        await initiatePayout({
            data: {
                amount,
                currency: fields.provider.currency,
                phoneNumber: fields.phoneNumber,
                provider: fields.provider.provider,
            },
        })
        setAmount("")
        fields.reset()
        onOpenChange(false)
    }

    return (
        <DialogWidget
            open={open}
            onOpenChange={onOpenChange}
            title="Cash out"
            description="Send funds from the platform's PawaPay wallet to a mobile money account."
            footer={
                <>
                    <Button
                        type="button"
                        isDisabled={
                            !amount.trim() ||
                            !fields.provider ||
                            !fields.phoneNumber.trim() ||
                            isPending
                        }
                        onClick={() => void handlePayout()}
                    >
                        Send payout
                    </Button>
                    <DrawerClose
                        render={<Button type="button" variant="outline" />}
                    >
                        Cancel
                    </DrawerClose>
                </>
            }
        >
            <FieldGroup className="grid grid-cols-2 gap-3">
                <PaymentFields
                    idPrefix="payout"
                    kind="payout"
                    fields={fields}
                    amount={amount}
                    onAmountChange={setAmount}
                />
            </FieldGroup>
        </DialogWidget>
    )
}

const Refund: FC<RefundProps> = ({ payment, onOpenChange }) => {
    const { mutateAsync: initiateRefund, isPending } = useInitiateRefund()
    const [amount, setAmount] = useState("")

    useEffect(() => {
        if (payment) setAmount(payment.amount)
    }, [payment])

    const handleRefund = async () => {
        if (!payment) return
        await initiateRefund({ data: { paymentId: payment.id, amount } })
        onOpenChange(false)
    }

    return (
        <DialogWidget
            open={payment !== null}
            onOpenChange={onOpenChange}
            title="Refund deposit"
            description={
                payment
                    ? `Reverses ${payment.userName ?? payment.userId}'s deposit of ${payment.amount} ${payment.currency}. Partial refunds are allowed as long as the total doesn't exceed the original amount.`
                    : undefined
            }
            footer={
                <>
                    <Button
                        type="button"
                        variant="destructive"
                        isDisabled={!amount.trim() || isPending}
                        onClick={() => void handleRefund()}
                    >
                        Refund
                    </Button>
                    <DrawerClose
                        render={<Button type="button" variant="outline" />}
                    >
                        Cancel
                    </DrawerClose>
                </>
            }
        >
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="refund-amount">
                        Amount {payment ? `(${payment.currency})` : ""}
                    </FieldLabel>
                    <Input
                        id="refund-amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </Field>
            </FieldGroup>
        </DialogWidget>
    )
}

export const Payment = { Payout, Refund }
