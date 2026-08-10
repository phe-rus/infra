import { DEFAULT_ENABLED_METHODS } from "@/auth/settings/methods"
import { FIXED_ROLE_NAMES } from "@/auth/permissions"
import { z } from "zod"

export const STEPS = ["Basics", "Security", "Providers", "Roles", "Owner"] as const

export const FIXED_ROLE_COPY: Record<(typeof FIXED_ROLE_NAMES)[number], string> = {
    owner: "Full access. Automatically assigned to the account you're about to create. There's only ever one.",
    admin: "Full access, same as owner. Assign this to other trusted users later.",
    user: "No elevated permissions. The default role for anyone who signs up.",
}

export const wizardSchema = z.object({
    appName: z.string().min(1, "App name is required"),
    useSecureCookies: z.boolean(),
    crossSubDomainCookies: z.boolean(),
    cookieDomain: z.string(),
    requireEmailVerification: z.boolean(),
    authMethods: z.record(z.string(), z.boolean()),
    customRoles: z.array(
        z.object({
            name: z.string().min(1),
            permissions: z.object({
                user: z.array(z.string()),
                session: z.array(z.string()),
            }),
            adminTier: z.boolean(),
        })
    ),
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters").max(48, "At most 48 characters"),
    rememberMe: z.boolean(),
})

export type WizardValues = z.input<typeof wizardSchema>

export const wizardDefaultValues: WizardValues = {
    appName: "",
    useSecureCookies: false,
    crossSubDomainCookies: false,
    cookieDomain: "",
    requireEmailVerification: false,
    authMethods: DEFAULT_ENABLED_METHODS,
    customRoles: [],
    name: "",
    email: "",
    password: "",
    rememberMe: true,
}
