import { setUserRole } from "./set-user-role"
import { useAppMutation } from "@/kit/shared"
import type { UsersListData } from "@/kit/types"
import { usersQueryOptions } from "./users-query-options"
import { patchUserInCache } from "@/kit/shared"

export const useSetUserRole = () =>
    useAppMutation({
        mutationFn: setUserRole,
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.data.userId, { role: variables.data.role }),
        },
        successMessage: "Role updated",
        errorMessage: "Could not update role",
    })
