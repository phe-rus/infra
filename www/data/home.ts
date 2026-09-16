import { z } from "zod"
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

const ShowcaseTabItemSchema = z.object({
    title: z.string(),
    description: z.string(),
    to: z.string(),
    img: z.string(),
})

const ShowcaseTabSchema = z.object({
    tabKey: messageKey,
    items: z.array(ShowcaseTabItemSchema),
})

const HomeSchema = z.object({
    path: z.literal("/"),
    title: z.string(),
    descriptionKey: messageKey,
    fields: z.array(FieldSchema),
    showcaseTabs: z.array(ShowcaseTabSchema),
})

export const home = defaultHandlers(HomeSchema)({
    path: "/",
    title: "Pherus",
    descriptionKey: "overview.hero.description",
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
            tabKey: "overview.showcase.tabs.projects",
            items: [
                {
                    title: "Awwwards Hero",
                    description:
                        "Awwwards nomination and a People's Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.",
                    to: "/",
                    img: "/og.png",
                },
                {
                    title: "Awwwards Hero",
                    description:
                        "Awwwards nomination and a People's Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.",
                    to: "/",
                    img: "/og.png",
                },
                {
                    title: "Awwwards Hero",
                    description:
                        "Awwwards nomination and a People's Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.",
                    to: "/",
                    img: "/og.png",
                },
            ],
        },
        {
            tabKey: "overview.showcase.tabs.research",
            items: [
                {
                    title: "Awwwards Hero",
                    description:
                        "Awwwards nomination and a People's Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.",
                    to: "/",
                    img: "/og.png",
                },
                {
                    title: "Awwwards Hero",
                    description:
                        "Awwwards nomination and a People's Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.",
                    to: "/",
                    img: "/og.png",
                },
            ],
        },
        {
            tabKey: "overview.showcase.tabs.redesign",
            items: [
                {
                    title: "Awwwards Hero",
                    description:
                        "Awwwards nomination and a People's Choice Award at Awwwards. The project was built using React, Next.js, and Tailwind CSS.",
                    to: "/",
                    img: "/og.png",
                },
            ],
        },
    ],
})
