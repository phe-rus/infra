export interface Domain {
    slug: string
    label: string
    description: string
}

export type InitiativeKind =
    | "infrastructure"
    | "platform"
    | "research"
    | "application"
    | "initiative"

export type InitiativeStatus =
    | "live"
    | "in-development"
    | "research"
    | "experimental"
    | "planned"
    | "archived"

export interface Initiative {
    slug: string
    name: string
    domain: string
    kind: InitiativeKind
    /**
     * Unset unless verified. An unset status renders no badge at all,
     * that is the honest state for anything not confirmed.
     */
    status?: InitiativeStatus
    summary: string
}

export const STATUS_LABEL: Record<InitiativeStatus, string> =
    {
        live: "Live",
        "in-development": "In development",
        research: "Research",
        experimental: "Experimental",
        planned: "Planned",
        archived: "Archived",
    }

/**
 * This grouping is a presentational device to show how the initiatives
 * relate to each other, not official Pherus terminology. The actual
 * relationship, per the source brief, is a flat list of initiatives
 * directly under Pherus (Pass contains infra + accounts internally).
 */
export const domains: Domain[] = [
    {
        slug: "identity",
        label: "Identity & Infrastructure",
        description:
            "Shared systems the rest of the ecosystem depends on.",
    },
    {
        slug: "science",
        label: "Research & Science",
        description:
            "Investigating a specific domain properly before building on top of it.",
    },
    {
        slug: "knowledge",
        label: "Knowledge & Culture",
        description:
            "Preserving and exploring knowledge, stories, and people.",
    },
    {
        slug: "practical",
        label: "Practical Systems",
        description:
            "Applying technology to problems beyond software.",
    },
    {
        slug: "personal",
        label: "Personal Systems",
        description:
            "Simple, private tools for one person at a time.",
    },
]

export const initiatives: Initiative[] = [
    {
        slug: "pass",
        name: "Pass",
        domain: "identity",
        kind: "infrastructure",
        status: "live",
        summary:
            "Shared identity and authentication across the Pherus ecosystem, so one account works everywhere instead of a separate login per system.",
    },
    {
        slug: "collective",
        name: "Collective",
        domain: "identity",
        kind: "infrastructure",
        summary:
            "Infrastructure for people to collaborate around Pherus and its projects.",
    },
    {
        slug: "object",
        name: "Object",
        domain: "identity",
        kind: "infrastructure",
        summary:
            "Storage and object infrastructure for the rest of the ecosystem.",
    },
    {
        slug: "seer",
        name: "Seer",
        domain: "science",
        kind: "research",
        summary:
            "Applied chemistry and wellness research within Pherus's broader science work.",
    },
    {
        slug: "scholar-of-yore",
        name: "Scholar of Yore",
        domain: "knowledge",
        kind: "initiative",
        summary:
            "Preserving and exploring knowledge, stories, people, and cultures.",
    },
    {
        slug: "farm",
        name: "Farm",
        domain: "practical",
        kind: "initiative",
        summary:
            "Food systems, agriculture, and permaculture based exploration.",
    },
    {
        slug: "pherus-health",
        name: "Pherus Health",
        domain: "practical",
        kind: "initiative",
        summary:
            "A developing direction in practical health technology and systems.",
    },
    {
        slug: "pherus-pride",
        name: "Pherus Pride",
        domain: "practical",
        kind: "platform",
        summary:
            "Queer-to-queer resources, community, and mutual aid: healthcare, safe spaces, jobs, and legal support, organized by trust and country.",
    },
    {
        slug: "notables",
        name: "Notables",
        domain: "personal",
        kind: "application",
        summary:
            "A private, simple, secure place for personal notes. Not a dashboard.",
    },
]
