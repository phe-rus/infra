import { z } from "zod"
import { m } from "@/src/paraglide/messages"

export function getProfileSchema() {
    return z.object({
        name: z.string().min(1, m["profile.nameRequired"]()),
        bio: z
            .string()
            .max(280, m["profile.bioTooLong"]())
            .optional(),
        avatar: z.file().nullable(),
        email: z.email(),
        id: z.string(),
        role: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        emailVerified: z.string(),
    })
}

export type ProfileFormValues = z.input<
    ReturnType<typeof getProfileSchema>
>
