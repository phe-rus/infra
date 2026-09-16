import {
    HeartHandshakeIcon,
    IdeaIcon,
    LegalIcon,
    Location01Icon,
    RainbowIcon,
    RouteIcon,
    Science,
    SecurityIcon,
    SoftwareIcon,
} from "@hugeicons/core-free-icons"

export const icons = {
    idea: IdeaIcon,
    location: Location01Icon,
    route: RouteIcon,
    security: SecurityIcon,
    "heart-handshake": HeartHandshakeIcon,
    legal: LegalIcon,
    rainbow: RainbowIcon,
    science: Science,
    software: SoftwareIcon,
} as const

export type IconKey = keyof typeof icons
