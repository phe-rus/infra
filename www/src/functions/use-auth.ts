import { z } from "zod"
import { useAppMutation } from "@infra/ui/hooks/use-app-mutation"
import { authClient } from "@/lib/auth-client"
import { currentOptions } from "./get-auth"

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

type UpdateProfileInput = {
    value: ProfileFormValues
    original: ProfileFormValues
}

export const useUpdateProfile = () =>
    useAppMutation({
        mutationFn: async ({ value, original }: UpdateProfileInput) => {
            const changes: { name?: string; bio?: string; image?: string } = {}
            if (value.name !== original.name) changes.name = value.name
            if (value.bio !== original.bio) changes.bio = value.bio

            if (value.avatar) {
                const { data, error } = await authClient.r2.uploadAvatar(value.avatar)
                if (error) throw new Error(error.message ?? "Could not upload avatar")
                if (data.url) changes.image = data.url
            }

            if (Object.keys(changes).length > 0) {
                await authClient.updateUser(changes)
            }
        },
        invalidates: [currentOptions().queryKey],
        successMessage: "Profile updated",
    })
