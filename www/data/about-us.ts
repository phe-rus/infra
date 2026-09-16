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

const AboutUsSchema = z.object({
    path: z.literal("/about-us"),
    titleKey: messageKey,
    descriptionKey: messageKey,
    sections: z.array(AboutSectionSchema),
    contactEmail: z.string(),
})

export const aboutUs = defaultHandlers(AboutUsSchema)({
    path: "/about-us",
    titleKey: "nav.about-us",
    descriptionKey: "about.description",
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
    contactEmail: "pherus@pherus.org",
})
