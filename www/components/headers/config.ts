export interface NavLeaf {
    label: string
    description: string
    to: string
    tag: "active" | "in development" | "in planning"
}

export interface NavSection {
    label: string
    items: NavLeaf[]
}

export interface NavLink {
    label: string
    to: string
}

export interface NavGroup {
    label: string
    items: NavSection[]
}

export type NavTriggerProps = {
    label: string
    to?: string
    active: boolean
    onMouseEnter: () => void
}

export type NavItem = NavLink | NavGroup

export function isNavGroup(item: NavItem): item is NavGroup {
    return "items" in item
}

export const config: NavItem[] = [
    {
        label: "Overview",
        to: "/",
    },
    {
        label: "Resources",
        items: [
            {
                label: "Platforms & Services",
                items: [
                    {
                        label: "Infra",
                        description:
                            "Centralized authentication infrastructure",
                        to: "/r/infra",
                        tag: "active",
                    },
                    {
                        label: "Accounts",
                        description:
                            "Centralized user accounts",
                        to: "/r/accounts",
                        tag: "active",
                    },
                    {
                        label: "Pherus developers",
                        description:
                            "Every public repository, gathered into one structure",
                        to: "/r/pherus-developers",
                        tag: "in planning",
                    },
                    {
                        label: "Pherus assets",
                        description:
                            "Storage in your own Cloudflare account, you own the data and the bill",
                        to: "/r/pherus-assets",
                        tag: "in planning",
                    },
                ],
            },
            {
                label: "Products",
                items: [
                    {
                        label: "Seer",
                        description:
                            "Cosmetics built in the open, ingredient research and DIY formulas published alongside the products",
                        to: "/r/seer",
                        tag: "in development",
                    },
                    {
                        label: "Pherus basic",
                        description:
                            "One small compute core, docked into whichever shell you need",
                        to: "/r/pherus-basic",
                        tag: "in planning",
                    },
                ],
            },
            {
                label: "Community & Knowledge",
                items: [
                    {
                        label: "Transspace",
                        description:
                            "Queer people helping queer people through shared knowledge and experience",
                        to: "/r/transspace",
                        tag: "in development",
                    },
                    {
                        label: "Pherus scholar",
                        description:
                            "A living archive of the world's cultures, starting in Africa",
                        to: "/r/pherus-scholar",
                        tag: "in planning",
                    },
                ],
            },
            {
                label: "Health & Home",
                items: [
                    {
                        label: "Pherus health",
                        description:
                            "A holistic healthcare platform built around the whole person",
                        to: "/r/pherus-health",
                        tag: "in planning",
                    },
                    {
                        label: "Pherus homes",
                        description:
                            "Shelter, food, and dignity, treated as engineering problems worth solving",
                        to: "/r/pherus-homes",
                        tag: "in planning",
                    },
                ],
            },
            {
                label: "Frontier",
                items: [
                    {
                        label: "Pherus space & robotics",
                        description:
                            "Vehicles designed to be lived in, not just launched",
                        to: "/r/pherus-space",
                        tag: "in planning",
                    },
                    {
                        label: "Pherus agriculture",
                        description:
                            "Permaculture-structured food sharing, aid and income together",
                        to: "/r/pherus-agriculture",
                        tag: "in planning",
                    },
                ],
            },
        ],
    },
    {
        label: "FAQ",
        to: "/faq",
    },
    {
        label: "Blog",
        to: "/blog",
    },
]
