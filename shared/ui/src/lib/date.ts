import { format } from "date-fns"

/**
 * date-fns' format() always renders in whatever timezone the process
 * running it is in. In an SSR app that's the server's system timezone for
 * the first paint and the viewer's browser timezone for hydration/re-renders
 * — two different processes, so a date near a day boundary can render as a
 * different calendar day between the two, which React treats as a
 * hydration mismatch. formatUtc sidesteps this by constructing a Date whose
 * *local* getters equal the original date's *UTC* getters, so format()'s
 * local rendering comes out UTC-consistent everywhere, regardless of which
 * timezone the server or the viewer's browser is actually in.
 */
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
