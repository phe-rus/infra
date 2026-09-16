import { m } from "@/paraglide/messages"
import {
    CodeIcon,
    GalleryThumbnailsIcon,
    HomeIcon,
    InfoIcon,
    Legal01Icon,
} from "@hugeicons/core-free-icons"

type IconType = typeof HomeIcon

export type NavLeaf = {
    label: string
    to: string
}

export type NavItem = {
    label: string
    to: string
    Icon: IconType
    items?: NavLeaf[]
}

export function getNavItems(): NavItem[] {
    return [
        {
            label: m["nav.home"](),
            to: "/",
            Icon: HomeIcon,
        },
        {
            label: m["nav.showcase"](),
            to: "/showcase",
            Icon: GalleryThumbnailsIcon,
        },
        {
            label: m["nav.about-us"](),
            to: "/about-us",
            Icon: InfoIcon,
        },
        {
            label: m["nav.legal.label"](),
            to: "/legal",
            Icon: Legal01Icon,
            items: [
                {
                    label: m["nav.legal.terms-of-service"](),
                    to: "/legal/terms-of-service",
                },
                {
                    label: m["nav.legal.privacy-policy"](),
                    to: "/legal/privacy-policy",
                },
                {
                    label: m["nav.legal.cookie-policy"](),
                    to: "/legal/cookie-policy",
                },
                {
                    label: m["nav.legal.legal-notice"](),
                    to: "/legal/legal-notice",
                },
            ],
        },
        {
            label: m["nav.licenses.label"](),
            to: "/licenses",
            Icon: CodeIcon,
            items: [
                {
                    label: m["nav.licenses.pherus-license"](),
                    to: "/licenses/pherus-license",
                },
                {
                    label: m["nav.licenses.mit-license"](),
                    to: "/licenses/mit-license",
                },
                {
                    label: m[
                        "nav.licenses.apache-2.0-license"
                    ](),
                    to: "/licenses/apache-2.0-license",
                },
                {
                    label: m[
                        "nav.licenses.gpl-3.0-license"
                    ](),
                    to: "/licenses/gpl-3.0-license",
                },
            ],
        },
    ]
}
