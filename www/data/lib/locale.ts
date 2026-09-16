import { getLocale } from "@/paraglide/runtime"

export type Locale = "en" | "zh" | "fr"

export function activeLocale(): Locale {
    return getLocale() as Locale
}
