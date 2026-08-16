import { z } from "zod"

export const signInSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
    // present when this sign-in was reached mid-OAuth-authorize-flow (the
    // oauth-provider plugin's own before/after hooks read this — it's not
    // consumed directly here, just forwarded to auth.api.signInEmail)
    oauthQuery: z.string().optional(),
})

export const signInSearchSchema = z.object({
    reason: z.enum(["session-expired"]).optional(),
})

export const completeSetupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters").max(48, "At most 48 characters"),
    rememberMe: z.boolean().optional(),
})

export const forgotPasswordSchema = z.object({
    email: z.email("Enter a valid email"),
})

export const resetPasswordSchema = z.object({
    newPassword: z.string().min(8, "At least 8 characters").max(48, "At most 48 characters"),
    token: z.string().min(1),
})
