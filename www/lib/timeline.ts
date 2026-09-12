export interface TimelineEntry {
    id: string
    label: string
    title: string
    body: string
}

/**
 * Only entries that are actually known. No invented dates or events.
 * Ordered most recent first; add real dated milestones here as they
 * become known, this component supports any number of entries.
 */
export const timeline: TimelineEntry[] = [
    {
        id: "now",
        label: "Now",
        title: "Pass is live",
        body: "Identity and accounts, combined, already running.",
    },
    {
        id: "origin",
        label: "Origin",
        title: "Pherus begins",
        body: "One founder, a lot of curiosity, and a name that means she who carries.",
    },
]
