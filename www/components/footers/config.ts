import { m } from "@/paraglide/messages"

export type FooterLink = {
    label: string
    /** An internal route. */
    to?: string
    /** An external link (e.g. mailto:). */
    href?: string
}

export type FooterGroup = {
    label: string
    links: FooterLink[]
}

export function getFooterGroups(): FooterGroup[] {
    return [
        {
            label: m["footer.company.label"](),
            links: [
                {
                    label: m["nav.about-us"](),
                    to: "/about-us",
                },
                {
                    label: m[
                        "footer.company.openKnowledge"
                    ](),
                },
                { label: m["footer.company.investors"]() },
                {
                    label: m["footer.company.contact"](),
                    href: "mailto:pherus@pherus.org",
                },
                { label: m["footer.company.blog"]() },
                { label: m["footer.company.faq"]() },
            ],
        },
        {
            label: m["footer.legal.label"](),
            links: [
                {
                    label: m["nav.legal.privacy-policy"](),
                    to: "/legal/privacy-policy",
                },
                {
                    label: m["nav.legal.terms-of-service"](),
                    to: "/legal/terms-of-service",
                },
            ],
        },
    ]
}
