import { z } from "zod"

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

export const updateUserDetailsSchema = z.object({
    userId: z.string().min(1),
    name: z.string().min(1),
    email: z.email(),
})

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
