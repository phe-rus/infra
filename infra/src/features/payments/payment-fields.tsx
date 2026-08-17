import type { FC } from "react"
import { Field, FieldLabel } from "@infra/ui/components/field"
import { Input } from "@infra/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@infra/ui/components/select"
import type { usePaymentFields } from "./use-payment-fields"

export type PaymentFieldsProps = {
    idPrefix: string
    kind: "deposit" | "payout"
    fields: ReturnType<typeof usePaymentFields>
    amount: string
    onAmountChange: (value: string) => void
}

export const PaymentFields: FC<PaymentFieldsProps> = ({ idPrefix, kind, fields, amount, onAmountChange }) => {
    const { countries, country, countryCode, selectCountry, provider, providerCode, setProviderCode, phoneNumber, setPhoneNumber } =
        fields

    const minAmount = kind === "deposit" ? provider?.depositMinAmount : provider?.payoutMinAmount
    const maxAmount = kind === "deposit" ? provider?.depositMaxAmount : provider?.payoutMaxAmount

    return (
        <>
            <Field>
                <FieldLabel htmlFor={`${idPrefix}-country`}>Country</FieldLabel>
                <Select
                    id={`${idPrefix}-country`}
                    aria-label="Country"
                    selectedKey={countryCode}
                    onSelectionChange={(key) => selectCountry(String(key))}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map((c) => (
                            <SelectItem key={c.country} id={c.country} textValue={c.name}>
                                <span className="flex items-center gap-2">
                                    <img src={c.flag} alt="" className="h-3.5 w-5 object-cover rounded-none!" />
                                    {c.name}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            <Field>
                <FieldLabel htmlFor={`${idPrefix}-provider`}>Provider</FieldLabel>
                <Select
                    id={`${idPrefix}-provider`}
                    aria-label="Provider"
                    selectedKey={providerCode}
                    onSelectionChange={(key) => setProviderCode(String(key))}
                    isDisabled={!country?.providers.length}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {country?.providers.map((p) => (
                            <SelectItem key={p.provider} id={p.provider} textValue={p.displayName}>
                                <span className="flex items-center gap-2">
                                    <img src={p.logo} alt="" className="size-4 object-contain" />
                                    {p.displayName}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            <Field className="col-span-2">
                <FieldLabel htmlFor={`${idPrefix}-phone`}>Phone number</FieldLabel>
                <Input
                    id={`${idPrefix}-phone`}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={country ? `${country.prefix}…` : undefined}
                />
            </Field>

            <Field className="col-span-2">
                <FieldLabel htmlFor={`${idPrefix}-amount`}>Amount {provider ? `(${provider.currency})` : ""}</FieldLabel>
                <Input
                    id={`${idPrefix}-amount`}
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder={minAmount ?? undefined}
                />
                {(minAmount || maxAmount) && (
                    <p className="text-muted-foreground text-xs">
                        {minAmount} – {maxAmount} {provider?.currency}
                    </p>
                )}
            </Field>
        </>
    )
}
