import { z } from "zod"

export const signInSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
    oauthQuery: z.string().optional(),
})

export const signInSearchSchema = z.object({
    reason: z.enum(["session-expired"]).optional(),
})

export const completeSetupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email"),
    password: z
        .string()
        .min(8, "At least 8 characters")
        .max(48, "At most 48 characters"),
    rememberMe: z.boolean().optional(),
})

export const forgotPasswordSchema = z.object({
    email: z.email("Enter a valid email"),
})

export const resetPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(8, "At least 8 characters")
        .max(48, "At most 48 characters"),
    token: z.string().min(1),
})
