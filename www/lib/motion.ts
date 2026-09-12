export const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Plain text/content entrance. Bespoke visuals (radial system, timeline,
 * showcase, photo reveals) get their own purpose-built variants instead
 * of reusing this.
 */
export function fadeUp(
    reduced: boolean | null,
    distance = 14
) {
    return {
        hidden: { opacity: 0, y: reduced ? 0 : distance },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: EASE },
        },
    }
}
