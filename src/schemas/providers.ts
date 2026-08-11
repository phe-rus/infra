import { z } from "zod"

export const providersSettingsSchema = z.object({
    requireEmailVerification: z.boolean(),
    authMethods: z.record(z.string(), z.boolean()),
    useSecureCookies: z.boolean(),
    crossSubDomainCookies: z.boolean(),
    cookieDomain: z.string(),
    trustedOrigins: z.array(z.string().min(1)),
})
