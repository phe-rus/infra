import { type FC, useState } from "react"
import { FieldGroup } from "@infra/ui/components/field"
import { Button } from "@infra/ui/components/button"
import { useInitiateDeposit } from "@/kit/payments"
import { PaymentFields } from "./payment-fields"
import { usePaymentFields } from "./use-payment-fields"

export const DepositForm: FC = () => {
    const { mutateAsync: initiateDeposit, isPending } = useInitiateDeposit()
    const fields = usePaymentFields()
    const [amount, setAmount] = useState("")

    async function handleDeposit() {
        if (!fields.provider) return
        await initiateDeposit({
            data: {
                amount,
                currency: fields.provider.currency,
                phoneNumber: fields.phoneNumber,
                provider: fields.provider.provider,
            },
        })
        setAmount("")
        fields.reset()
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                void handleDeposit()
            }}
            className="flex flex-col gap-3"
        >
            <FieldGroup className="grid grid-cols-2 gap-3">
                <PaymentFields idPrefix="deposit" kind="deposit" fields={fields} amount={amount} onAmountChange={setAmount} />
            </FieldGroup>
            <Button type="submit" isDisabled={!amount.trim() || !fields.provider || !fields.phoneNumber.trim() || isPending}>
                Pay
            </Button>
        </form>
    )
}
