import { unbanUser } from "./unban-user"
import { useAppMutation } from "@/kit/shared"
import type { UsersListData } from "@/kit/types"
import { usersQueryOptions } from "./users-query-options"
import { patchUserInCache } from "@/kit/shared"

export const useUnbanUser = () =>
    useAppMutation({
        mutationFn: unbanUser,
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.data.userId, { banned: false }),
        },
        successMessage: "User unbanned",
        errorMessage: "Could not unban user",
    })
