import { config as headerConfig, isNavGroup } from "@/components/headers/config"

export interface FooterLink {
    label: string
    to?: string
}

export interface FooterGroup {
    label: string
    items: FooterLink[]
}

const resources = headerConfig.find((item) => item.label === "Resources")
const divisionGroups =
    resources && isNavGroup(resources)
        ? resources.items.map((section) => ({
              label: section.label,
              items: section.items.map((leaf) => ({ label: leaf.label, to: leaf.to })),
          }))
        : []

export const config: FooterGroup[] = [
    {
        label: "Company",
        items: [
            { label: "About" },
            { label: "Open Knowledge" },
            { label: "Investors" },
            { label: "Contact" },
            { label: "Blog", to: "/blog" },
            { label: "FAQ", to: "/faq" },
        ],
    },
    ...divisionGroups,
    {
        label: "Legal",
        items: [
            { label: "Privacy Policy" },
            { label: "Terms & Conditions" },
        ],
    },
]
