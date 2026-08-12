import type { SessionWithImpersonatedBy, UserWithRole } from "better-auth/plugins/admin"
import type { getUserDetailFn } from "@/functions/usersFn"

export type ListedUser = UserWithRole
export type UserSession = SessionWithImpersonatedBy
export type UserDetail = Awaited<ReturnType<typeof getUserDetailFn>>
