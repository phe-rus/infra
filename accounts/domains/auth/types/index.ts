import { z } from "zod"

export const profileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    bio: z.string().max(280, "At most 280 characters").optional(),
    avatar: z.file().nullable(),
    email: z.email(),
    id: z.string(),
    role: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    emailVerified: z.string(),
})

export type ProfileFormValues = z.input<typeof profileSchema>
