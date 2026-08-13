import { z } from "zod"

export const signInSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
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

export const userIdSchema = z.object({ userId: z.string().min(1) })

export const createUserSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8).max(48),
    role: z.enum(["owner", "admin", "user"]),
})

export const setUserRoleSchema = z.object({
    userId: z.string().min(1),
    role: z.enum(["owner", "admin", "user"]),
})

export const updateUserDetailsSchema = z
    .object({
        userId: z.string().min(1),
        name: z.string().min(1).optional(),
        email: z.email().optional(),
    })
    .refine((data) => data.name !== undefined || data.email !== undefined, {
        message: "Nothing to update",
    })

export const deleteObjectSchema = z.object({ key: z.string().min(1) })

export const deleteFolderSchema = z.object({ prefix: z.string().min(1) })

export const banUserSchema = z.object({
    userId: z.string().min(1),
    banReason: z.string().optional(),
    banExpiresIn: z.number().positive().optional(),
})

export const revokeUserSessionSchema = z.object({ sessionToken: z.string().min(1) })

export const setUserPasswordSchema = z.object({
    userId: z.string().min(1),
    newPassword: z.string().min(8).max(48),
})

export const applicationIdSchema = z.object({ applicationId: z.string().min(1) })

export const createApplicationSchema = z.object({
    name: z.string().min(1),
    type: z.enum(["mobile", "web", "cli", "desktop", "other"]),
    identifier: z
        .string()
        .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase letters, numbers, and hyphens only")
        .optional(),
})

export const setApplicationActiveSchema = z.object({
    applicationId: z.string().min(1),
    active: z.boolean(),
})
