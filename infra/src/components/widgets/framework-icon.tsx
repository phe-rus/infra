import type { Framework } from "@/kit/console"
import { IconCode } from "@tabler/icons-react"

// simplified, hand-drawn stand-ins for each framework's mark — not traced
// from official brand assets, just enough to be visually recognizable in a
// small picker/avatar context
const ICONS: Record<Exclude<Framework, "other">, (props: { className?: string }) => React.JSX.Element> = {
    react: ({ className }) => (
        <svg viewBox="0 0 24 24" className={className} fill="none">
            <circle cx="12" cy="12" r="2" fill="#61DAFB" />
            <g stroke="#61DAFB" strokeWidth="1.2">
                <ellipse cx="12" cy="12" rx="10" ry="4.2" />
                <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
                <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
            </g>
        </svg>
    ),
    vue: ({ className }) => (
        <svg viewBox="0 0 24 24" className={className}>
            <path d="M2 3h4.2L12 13l5.8-10H22L12 21 2 3Z" fill="#41B883" />
            <path d="M6.2 3H9.8L12 6.8 14.2 3h3.6L12 13 6.2 3Z" fill="#35495E" />
        </svg>
    ),
    angular: ({ className }) => (
        <svg viewBox="0 0 24 24" className={className}>
            <path d="M12 2 21 5.5 19.6 18 12 22 4.4 18 3 5.5 12 2Z" fill="#DD0031" />
            <path d="M12 4.4 18 17h-2.3l-1.2-3H9.5l-1.2 3H6L12 4.4Zm0 3.6-1.7 4h3.4L12 8Z" fill="#fff" />
        </svg>
    ),
    next: ({ className }) => (
        <svg viewBox="0 0 24 24" className={className}>
            <circle cx="12" cy="12" r="11" fill="#000" />
            <path d="M9 8h1.6l5 7V8H17v9h-1.6l-5-7v7H9V8Z" fill="#fff" />
        </svg>
    ),
    kotlin: ({ className }) => (
        <svg viewBox="0 0 24 24" className={className}>
            <path d="M3 3h18L12 12l9 9H3l9-9L3 3Z" fill="#7F52FF" />
        </svg>
    ),
    swift: ({ className }) => (
        <svg viewBox="0 0 24 24" className={className}>
            <path
                d="M4 4c8 0 15 5 16 12-3-1-6-3-8-5 2 4 1 8-3 9C4 21 2 15 3 10c-1 2-1 4-1 6C1 11 2 6 4 4Z"
                fill="#FA7343"
            />
        </svg>
    ),
    flutter: ({ className }) => (
        <svg viewBox="0 0 24 24" className={className}>
            <path d="M14 2 3 13h6l11-11h-6Z" fill="#02569B" />
            <path d="M9 13 3 19l3 3 11-11h-6l-2 2Z" fill="#02569B" />
        </svg>
    ),
}

export function FrameworkIcon({ framework, className }: { framework: string | null; className?: string }) {
    const Icon = framework && framework !== "other" ? ICONS[framework as Exclude<Framework, "other">] : undefined
    if (!Icon) return <IconCode className={className} />
    return <Icon className={className} />
}
