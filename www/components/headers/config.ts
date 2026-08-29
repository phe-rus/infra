export interface NavLeaf {
    label: string
    description: string
    to: string
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
                    },
                    {
                        label: "Accounts",
                        description:
                            "Centralized user accounts",
                        to: "/r/accounts",
                    },
                ],
            },
            {
                label: "Organizations",
                items: [
                    {
                        label: "Pherus health",
                        description:
                            "Holistic health care services",
                        to: "/r/pherus-health",
                    },
                    {
                        label: "Pherus space & robotics",
                        description:
                            "Space exploration and robotics development",
                        to: "/r/pherus-space",
                    },
                    {
                        label: "Transspace",
                        description:
                            "Queer-led resource platform",
                        to: "/r/transspace",
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
