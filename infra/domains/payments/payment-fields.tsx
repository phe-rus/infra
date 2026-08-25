import type { FC } from "react"
import { Field, FieldLabel } from "@infra/ui/components/field"
import { Input } from "@infra/ui/components/input"
import { CountryProviderFields } from "@infra/ui/widgets/country-provider-fields"
import type { usePaymentFields } from "./use-payment-fields"

export type PaymentFieldsProps = {
    idPrefix: string
    kind: "deposit" | "payout"
    fields: ReturnType<typeof usePaymentFields>
    amount: string
    onAmountChange: (value: string) => void
}

export const PaymentFields: FC<PaymentFieldsProps> = ({
    idPrefix,
    kind,
    fields,
    amount,
    onAmountChange,
}) => {
    const { provider } = fields

    const minAmount = kind === "deposit" ? provider?.depositMinAmount : provider?.payoutMinAmount
    const maxAmount = kind === "deposit" ? provider?.depositMaxAmount : provider?.payoutMaxAmount

    return (
        <>
            <CountryProviderFields idPrefix={idPrefix} phoneClassName="col-span-2" {...fields} />

            <Field className="col-span-2">
                <FieldLabel htmlFor={`${idPrefix}-amount`}>
                    Amount {provider ? `(${provider.currency})` : ""}
                </FieldLabel>
                <Input
                    id={`${idPrefix}-amount`}
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder={minAmount ?? undefined}
                />
                {(minAmount || maxAmount) && (
                    <p className="text-xs text-muted-foreground">
                        {minAmount} – {maxAmount} {provider?.currency}
                    </p>
                )}
            </Field>
        </>
    )
}
