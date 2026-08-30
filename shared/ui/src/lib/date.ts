import { format } from "date-fns"

export function formatUtc(date: Date | string | number, formatStr: string): string {
    const d = new Date(date)
    const utcAsLocal = new Date(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds(),
        d.getUTCMilliseconds()
    )
    return format(utcAsLocal, formatStr)
}
