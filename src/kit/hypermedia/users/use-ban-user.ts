import { banUser } from "./ban-user"
import { useAppMutation } from "@/kit/shared"
import type { UsersListData } from "@/kit/types"
import { usersQueryOptions } from "./users-query-options"
import { patchUserInCache } from "@/kit/shared"

export const useBanUser = () =>
    useAppMutation({
        mutationFn: banUser,
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.data.userId, { banned: true }),
        },
        successMessage: "User banned",
        errorMessage: "Could not ban user",
    })
