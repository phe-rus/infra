export interface TimelineEntry {
    id: string
    label: string
    title: string
    body: string
    /** Larger entries get more visual weight; everything defaults to "sm". */
    size?: "sm" | "lg"
    /** Optional photo seed for entries that can carry an image. */
    photo?: string
}

/**
 * Only entries that are actually known. No invented dates or events.
 * Ordered most recent first; add real dated milestones here as they
 * become known, the timeline component supports any number of entries
 * of either size, with or without a photo.
 */
export const timeline: TimelineEntry[] = [
    {
        id: "now",
        label: "Now",
        title: "Pass is live",
        body: "Identity and accounts, combined, already running.",
        size: "lg",
        photo: "pherus-now",
    },
    {
        id: "origin",
        label: "Origin",
        title: "Pherus begins",
        body: "One founder, a lot of curiosity, and a name that means she who carries.",
        size: "lg",
        photo: "pherus-origin",
    },
]
