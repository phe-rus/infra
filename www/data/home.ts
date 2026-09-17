import { z } from "zod"
import type { HomeCategory } from "./showcase"
import type { IconKey } from "./icons"
import { defaultHandlers } from "./lib/handler"
import { messageKey } from "./lib/message-key"

const FieldSchema = z.object({
    icon: z.enum([
        "security",
        "heart-handshake",
        "legal",
        "rainbow",
        "science",
        "software",
    ] satisfies IconKey[]),
    titleKey: messageKey,
    items: z.array(z.string()),
    descriptionKey: messageKey,
})

const ShowcaseTabSchema = z.object({
    category: z.enum([
        "identity",
        "community",
        "research",
    ] satisfies HomeCategory[]),
    titleKey: messageKey,
})

const HomeSchema = z.object({
    path: z.literal("/"),
    title: z.string(),
    descriptionKey: messageKey,
    keywords: z.array(z.string()),
    fields: z.array(FieldSchema),
    showcaseTabs: z.array(ShowcaseTabSchema),
})

export const home = defaultHandlers(HomeSchema)({
    path: "/",
    title: "Pherus",
    descriptionKey: "overview.hero.description",
    keywords: [
        "Pherus",
        "Identity and access",
        "Health and wellbeing",
        "Justice and governance",
        "Queer life and community",
        "Science and research",
        "Software and infrastructure",
        "Pherus Pass",
        "Pherus Health",
    ],
    fields: [
        {
            icon: "security",
            titleKey: "overview.fields.identity.title",
            items: [
                "Pherus Pass",
                "Pherus Account",
                "Authentication",
            ],
            descriptionKey:
                "overview.fields.identity.description",
        },
        {
            icon: "heart-handshake",
            titleKey: "overview.fields.health.title",
            items: [
                "Pherus Health",
                "Health research",
                "Care infrastructure",
            ],
            descriptionKey:
                "overview.fields.health.description",
        },
        {
            icon: "legal",
            titleKey: "overview.fields.justice.title",
            items: [
                "Pleadli",
                "Legal technology",
                "Civic systems",
            ],
            descriptionKey:
                "overview.fields.justice.description",
        },
        {
            icon: "rainbow",
            titleKey: "overview.fields.queer.title",
            items: [
                "Pherus Transspace",
                "Q2Q network",
                "Community resources",
            ],
            descriptionKey:
                "overview.fields.queer.description",
        },
        {
            icon: "science",
            titleKey: "overview.fields.science.title",
            items: [
                "Research",
                "Experiments",
                "Scientific projects",
            ],
            descriptionKey:
                "overview.fields.science.description",
        },
        {
            icon: "software",
            titleKey: "overview.fields.software.title",
            items: [
                "Open source",
                "Developer tools",
                "Pherus infrastructure",
            ],
            descriptionKey:
                "overview.fields.software.description",
        },
    ],
    showcaseTabs: [
        {
            category: "identity",
            titleKey: "overview.showcase.tabs.identity",
        },
        {
            category: "community",
            titleKey: "overview.showcase.tabs.community",
        },
        {
            category: "research",
            titleKey: "overview.showcase.tabs.research",
        },
    ],
})
