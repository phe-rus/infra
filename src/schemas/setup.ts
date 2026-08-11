import { z } from "zod"

export const completeSetupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters").max(48, "At most 48 characters"),
    rememberMe: z.boolean().optional(),
})
