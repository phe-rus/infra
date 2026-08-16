import { type FC, useEffect, useState } from "react"
import { DrawerClose } from "@infra/ui/components/ui/drawer"
import { DialogWidget } from "@infra/ui/components/widgets/dialog-widget"
import { Field, FieldLabel, FieldGroup } from "@infra/ui/components/ui/field"
import { Input } from "@infra/ui/components/ui/input"
import { Button } from "@infra/ui/components/ui/button"
import { useInitiateRefund } from "@/kit/payments"
import type { ListedPayment } from "@/kit/payments"

export type RefundDialogProps = {
    payment: ListedPayment | null
    onOpenChange: (open: boolean) => void
}

export const RefundDialog: FC<RefundDialogProps> = ({ payment, onOpenChange }) => {
    const { mutateAsync: initiateRefund, isPending } = useInitiateRefund()
    const [amount, setAmount] = useState("")

    useEffect(() => {
        if (payment) setAmount(payment.amount)
    }, [payment])

    async function handleRefund() {
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
                    <DrawerClose render={<Button type="button" variant="outline" />}>Cancel</DrawerClose>
                </>
            }
        >
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="refund-amount">Amount {payment ? `(${payment.currency})` : ""}</FieldLabel>
                    <Input id="refund-amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </Field>
            </FieldGroup>
        </DialogWidget>
    )
}
