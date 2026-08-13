import type { SessionWithImpersonatedBy, UserWithRole } from "better-auth/plugins/admin"
import type { getUserDetail, listUsers } from "@/kit/hypermedia/users"
import type { browseObjects } from "@/kit/hypermedia/objects"
import type { listApplications } from "@/kit/hypermedia/applications"

export type ListedUser = UserWithRole
export type UserSession = SessionWithImpersonatedBy
export type UserDetail = Awaited<ReturnType<typeof getUserDetail>>
export type UsersListData = Awaited<ReturnType<typeof listUsers>>
export type ObjectsBrowseResult = Awaited<ReturnType<typeof browseObjects>>
export type ApplicationsListData = Awaited<ReturnType<typeof listApplications>>
export type ListedApplication = ApplicationsListData["applications"][number]
