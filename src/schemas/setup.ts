import { z } from "zod"
import { customRoleSchema } from "./role"

export const wizardSchema = z.object({
    appName: z.string().min(1, "App name is required"),
    useSecureCookies: z.boolean(),
    crossSubDomainCookies: z.boolean(),
    cookieDomain: z.string(),
    requireEmailVerification: z.boolean(),
    authMethods: z.record(z.string(), z.boolean()),
    customRoles: z.array(customRoleSchema),
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters").max(48, "At most 48 characters"),
    rememberMe: z.boolean(),
})

export const completeSetupSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8).max(48),
    rememberMe: z.boolean().optional(),
    appName: z.string().min(1),
    security: z.object({
        useSecureCookies: z.boolean(),
        crossSubDomainCookies: z.boolean(),
        cookieDomain: z.string(),
    }),
    emailPassword: z.object({
        requireEmailVerification: z.boolean(),
    }),
    authMethods: z.record(z.string(), z.boolean()),
    customRoles: z.array(customRoleSchema),
})
