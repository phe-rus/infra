import { z } from "zod"

export const signInSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
})

export const signInSearchSchema = z.object({
    reason: z.enum(["session-expired"]).optional(),
})
