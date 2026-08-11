import type { z } from "zod"
import type { customRoleSchema } from "@/schemas/role"
import type { SessionWithImpersonatedBy, UserWithRole } from "better-auth/plugins/admin"
import type { getUserDetailFn } from "@/functions/usersFn"
import type { listApiKeysFn } from "@/functions/apiKeysFn"

export type CustomRole = z.infer<typeof customRoleSchema>

// listUsers/getUser return these exact shapes, so use better-auth's own
// types directly instead of re-deriving through our wrapper functions
export type ListedUser = UserWithRole
export type UserSession = SessionWithImpersonatedBy

// no single better-auth type covers this: it's our own composite of a user,
// their sessions, and their linked accounts (the last of which comes from a
// raw adapter query, not a typed better-auth endpoint), so this one does
// have to derive from our own function's return shape
export type UserDetail = Awaited<ReturnType<typeof getUserDetailFn>>

// better-auth's own ApiKey type (@better-auth/api-key/types) includes a
// `key` field (the hashed value) that listApiKeys never actually returns,
// so deriving from our wrapper's real return shape is the accurate one here
export type ApiKey = Awaited<ReturnType<typeof listApiKeysFn>>[number]

export const EXPIRATION_OPTIONS = [
    { id: "never", label: "Never", seconds: null },
    { id: "2592000", label: "30 days", seconds: 60 * 60 * 24 * 30 },
    { id: "7776000", label: "90 days", seconds: 60 * 60 * 24 * 90 },
    { id: "31536000", label: "1 year", seconds: 60 * 60 * 24 * 365 },
] as const
