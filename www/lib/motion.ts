import type { Transition, Variants } from "motion/react"

const revealTransition: Transition = {
    delay: 0.3,
    duration: 0.7,
}

export const reveal = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: revealTransition,
}

export const staggerContainer: Variants = {
    initial: {},
    whileInView: {
        transition: { staggerChildren: 0.1 },
    },
}

export const staggerItem: Variants = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
}
