import { Field, FieldLabel } from "../../components/field"
import { Input } from "../../components/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/select"

type Provider = {
    provider: string
    displayName: string
    logo: string
}

type Country = {
    country: string
    name: string
    flag: string
    prefix: string
    providers: Provider[]
}

export type CountryProviderFieldsProps = {
    idPrefix: string
    countries: Country[]
    country: Country | undefined
    countryCode: string
    selectCountry: (code: string) => void
    providerCode: string
    setProviderCode: (code: string) => void
    phoneNumber: string
    setPhoneNumber: (value: string) => void
    phoneClassName?: string
}

export function CountryProviderFields({
    idPrefix,
    countries,
    country,
    countryCode,
    selectCountry,
    providerCode,
    setProviderCode,
    phoneNumber,
    setPhoneNumber,
    phoneClassName,
}: CountryProviderFieldsProps) {
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
                                    <img
                                        src={c.flag}
                                        alt=""
                                        className="h-3.5 w-5 rounded-none! object-cover"
                                    />
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

            <Field className={phoneClassName}>
                <FieldLabel htmlFor={`${idPrefix}-phone`}>Phone number</FieldLabel>
                <Input
                    id={`${idPrefix}-phone`}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={country ? `${country.prefix}…` : undefined}
                />
            </Field>
        </>
    )
}
