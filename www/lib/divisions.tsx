import type { ReactNode } from "react"

export type DivisionStatus = "dev" | "planning"

export interface Division {
    name: string
    status: DivisionStatus
    description: string
    accent: ReactNode
}

export const DIVISIONS: Division[] = [
    {
        name: "Seer",
        status: "dev",
        description:
            "Cosmetics built in the open, ingredient research and DIY formulas published alongside the products.",
        accent: (
            <rect
                x="23"
                y="23"
                width="27"
                height="27"
                fill="#3B5B61"
                fillOpacity="0.9"
            />
        ),
    },
    {
        name: "Transspace",
        status: "dev",
        description:
            "Queer people helping queer people through shared knowledge and experience.",
        accent: (
            <circle
                cx="50"
                cy="42"
                r="17"
                fill="#C4667E"
                fillOpacity="0.85"
            />
        ),
    },
    {
        name: "Pherus scholar",
        status: "planning",
        description:
            "A living archive of the world's cultures, starting in Africa.",
        accent: (
            <>
                <rect
                    x="23"
                    y="30"
                    width="54"
                    height="6"
                    fill="#B8894A"
                    fillOpacity="0.85"
                />
                <rect
                    x="23"
                    y="43"
                    width="40"
                    height="6"
                    fill="#B8894A"
                    fillOpacity="0.85"
                />
                <rect
                    x="23"
                    y="56"
                    width="54"
                    height="6"
                    fill="#B8894A"
                    fillOpacity="0.85"
                />
            </>
        ),
    },
    {
        name: "Pherus health",
        status: "planning",
        description:
            "A holistic healthcare platform built around the whole person.",
        accent: (
            <>
                <rect
                    x="41"
                    y="23"
                    width="12"
                    height="54"
                    fill="#6B93A0"
                    fillOpacity="0.85"
                />
                <rect
                    x="23"
                    y="44"
                    width="54"
                    height="12"
                    fill="#6B93A0"
                    fillOpacity="0.85"
                />
            </>
        ),
    },
    {
        name: "Pherus basic",
        status: "planning",
        description:
            "One small compute core, docked into whichever shell you need.",
        accent: (
            <rect
                x="41"
                y="41"
                width="18"
                height="18"
                fill="#3B5B61"
                fillOpacity="0.95"
            />
        ),
    },
    {
        name: "Pherus homes",
        status: "planning",
        description:
            "Shelter, food, and dignity, treated as engineering problems worth solving.",
        accent: (
            <polygon
                points="50,25 77,55 23,55"
                fill="#B06A4A"
                fillOpacity="0.85"
            />
        ),
    },
    {
        name: "Pherus space & robotics",
        status: "planning",
        description:
            "Vehicles designed to be lived in, not just launched.",
        accent: (
            <rect
                x="38"
                y="38"
                width="24"
                height="24"
                fill="#4A4A7A"
                fillOpacity="0.85"
                transform="rotate(45 50 50)"
            />
        ),
    },
    {
        name: "Pherus developers",
        status: "planning",
        description:
            "Every public repository, gathered into one structure.",
        accent: (
            <>
                <rect
                    x="23"
                    y="23"
                    width="8"
                    height="54"
                    fill="#2C464B"
                    fillOpacity="0.9"
                />
                <rect
                    x="69"
                    y="23"
                    width="8"
                    height="54"
                    fill="#2C464B"
                    fillOpacity="0.9"
                />
            </>
        ),
    },
    {
        name: "Pherus assets",
        status: "planning",
        description:
            "Storage in your own Cloudflare account. You own the data and the bill.",
        accent: (
            <>
                <rect
                    x="23"
                    y="26"
                    width="54"
                    height="9"
                    fill="#5C6B72"
                    fillOpacity="0.85"
                />
                <rect
                    x="23"
                    y="45"
                    width="54"
                    height="9"
                    fill="#5C6B72"
                    fillOpacity="0.85"
                />
                <rect
                    x="23"
                    y="64"
                    width="54"
                    height="9"
                    fill="#5C6B72"
                    fillOpacity="0.85"
                />
            </>
        ),
    },
    {
        name: "Pherus agriculture",
        status: "planning",
        description:
            "Permaculture-structured food sharing, aid and income together.",
        accent: (
            <polygon
                points="36,23 58,23 64,77 42,77"
                fill="#6B7A3F"
                fillOpacity="0.85"
            />
        ),
    },
]
