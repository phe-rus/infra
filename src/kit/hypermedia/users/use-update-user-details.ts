import { updateUser } from "./update-user"
import { useAppMutation } from "@/kit/shared"
import type { UsersListData } from "@/kit/types"
import { usersQueryOptions } from "./users-query-options"
import { patchUserInCache } from "@/kit/shared"

export const useUpdateUserDetails = () =>
    useAppMutation({
        mutationFn: updateUser,
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                patchUserInCache(old, variables.data.userId, {
                    ...(variables.data.name !== undefined && { name: variables.data.name }),
                    ...(variables.data.email !== undefined && { email: variables.data.email }),
                }),
        },
        successMessage: "Details updated",
        errorMessage: "Could not update details",
    })
