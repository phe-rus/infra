import { DEFAULT_ENABLED_METHODS } from "@/auth/settings/methods"
import { FIXED_ROLE_NAMES } from "@/auth/permissions"
import { wizardSchema } from "@/schemas/setup"
import type { z } from "zod"

export const STEPS = ["Basics", "Security", "Providers", "Roles", "Owner"] as const

export const FIXED_ROLE_COPY: Record<(typeof FIXED_ROLE_NAMES)[number], string> = {
    owner: "Full access. Automatically assigned to the account you're about to create. There's only ever one.",
    admin: "Full access, same as owner. Assign this to other trusted users later.",
    user: "No elevated permissions. The default role for anyone who signs up.",
}

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
