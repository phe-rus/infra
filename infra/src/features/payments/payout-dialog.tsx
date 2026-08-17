import { type FC, useState } from "react"
import { DrawerClose } from "@infra/ui/components/drawer"
import { DialogWidget } from "@infra/ui/widgets/dialog-widget"
import { FieldGroup } from "@infra/ui/components/field"
import { Button } from "@infra/ui/components/button"
import { useInitiatePayout } from "@/kit/payments"
import { PaymentFields } from "./payment-fields"
import { usePaymentFields } from "./use-payment-fields"

export type PayoutDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const PayoutDialog: FC<PayoutDialogProps> = ({ open, onOpenChange }) => {
    const { mutateAsync: initiatePayout, isPending } = useInitiatePayout()
    const fields = usePaymentFields()
    const [amount, setAmount] = useState("")

    async function handlePayout() {
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
                        isDisabled={!amount.trim() || !fields.provider || !fields.phoneNumber.trim() || isPending}
                        onClick={() => void handlePayout()}
                    >
                        Send payout
                    </Button>
                    <DrawerClose render={<Button type="button" variant="outline" />}>Cancel</DrawerClose>
                </>
            }
        >
            <FieldGroup className="grid grid-cols-2 gap-3">
                <PaymentFields idPrefix="payout" kind="payout" fields={fields} amount={amount} onAmountChange={setAmount} />
            </FieldGroup>
        </DialogWidget>
    )
}
