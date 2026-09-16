import {
    getLocale,
    locales,
    setLocale,
} from "@/paraglide/runtime"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@infra/ui/components/select"
import { getNativeLanguageName } from "@lib/intl.displayNames"
import { useMemo } from "react"

export function LocaleSwitcher() {
    const langs = useMemo(() => {
        return Array.from(locales, (value) => ({
            value: value,
            label: getNativeLanguageName(value),
        }))
    }, [])

    return (
        <Select
            items={langs}
            defaultValue={getLocale()}
            // biome-ignore lint/suspicious/noExplicitAny: tanstack types are weird
            onValueChange={(v) => setLocale(v as any)}
        >
            <SelectTrigger
                size="sm"
                className="w-32 border-border/15! bg-card/15!"
            >
                <SelectValue placeholder="Languages" />
            </SelectTrigger>

            <SelectContent className="bg-background! ring-border/35!">
                <SelectGroup>
                    <SelectLabel>Languages</SelectLabel>
                    {langs.map((item) => (
                        <SelectItem
                            key={item.value}
                            value={item.value}
                        >
                            {item.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
