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

export const newPasswordSchema = resetPasswordSchema.pick({ newPassword: true })

// better-auth's own /reset-password/:token callback redirects here with
// ?token= appended (or ?error=INVALID_TOKEN if the link is bad/expired)
export const resetPasswordSearchSchema = z.object({
    token: z.string().optional(),
    error: z.string().optional(),
})
