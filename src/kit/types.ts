import type { SessionWithImpersonatedBy, UserWithRole } from "better-auth/plugins/admin"
import type { getUserDetail, listUsers } from "@/kit/hypermedia/users"
import type { browseObjects } from "@/kit/hypermedia/objects"

export type ListedUser = UserWithRole
export type UserSession = SessionWithImpersonatedBy
export type UserDetail = Awaited<ReturnType<typeof getUserDetail>>
export type UsersListData = Awaited<ReturnType<typeof listUsers>>
export type ObjectsBrowseResult = Awaited<ReturnType<typeof browseObjects>>
