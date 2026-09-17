import { z } from "zod"
import type { IconKey } from "./icons"
import { defaultHandlers } from "./lib/handler"
import { messageKey } from "./lib/message-key"

const AboutSectionSchema = z.object({
    icon: z.enum([
        "idea",
        "location",
        "route",
    ] satisfies IconKey[]),
    headingKey: messageKey,
    bodyKey: messageKey,
})

const PersonSchema = z.object({
    name: z.string(),
    legalName: z.string().optional(),
    roleKey: messageKey,
})

const AboutUsSchema = z.object({
    path: z.literal("/about-us"),
    titleKey: messageKey,
    descriptionKey: messageKey,
    keywords: z.array(z.string()),
    sections: z.array(AboutSectionSchema),
    people: z.array(PersonSchema),
    contactEmail: z.string(),
    contactPhone: z.string(),
})

export const aboutUs = defaultHandlers(AboutUsSchema)({
    path: "/about-us",
    titleKey: "nav.about-us",
    descriptionKey: "about.description",
    keywords: [
        "About Pherus",
        "Pherus Inc.",
        "Wakiso, Uganda",
        "Open source",
        "Decentralised systems",
        "Self-hosted",
        "Research and technology company",
    ],
    sections: [
        {
            icon: "idea",
            headingKey: "about.whatWeDo.heading",
            bodyKey: "about.whatWeDo.body",
        },
        {
            icon: "location",
            headingKey: "about.whereBased.heading",
            bodyKey: "about.whereBased.body",
        },
        {
            icon: "route",
            headingKey: "about.howWeWork.heading",
            bodyKey: "about.howWeWork.body",
        },
    ],
    people: [
        {
            name: "Tiabah La Niina",
            legalName: "Chotabhai Mike",
            roleKey: "about.people.founder",
        },
    ],
    contactEmail: "pherus@pherus.org",
    contactPhone: "+256 772 769 734",
})
