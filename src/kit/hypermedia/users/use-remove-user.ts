import { removeUser } from "./remove-user"
import { useAppMutation } from "@/kit/shared"
import type { UsersListData } from "@/kit/types"
import { usersQueryOptions } from "./users-query-options"

export const useRemoveUser = () =>
    useAppMutation({
        mutationFn: removeUser,
        invalidates: [usersQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: usersQueryOptions().queryKey,
            updater: (old: UsersListData | undefined, variables) =>
                old
                    ? {
                          ...old,
                          users: old.users.filter((u) => u.id !== variables.data.userId),
                          total: Math.max(0, old.total - 1),
                      }
                    : { users: [], total: 0 },
        },
        successMessage: "User removed",
        errorMessage: "Could not remove user",
    })
