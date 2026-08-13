import { createUser, removeUser, updateUser, uploadUserImage } from "./fnc"
import { patchUserInCache, useAppMutation } from "@/kit/shared"
import type { UsersListData } from "@/kit/types"
import { usersQueryOptions } from "./get-users"

export const useCreateUser = () =>
    useAppMutation({
        mutationFn: createUser,
        invalidates: [usersQueryOptions().queryKey],
        successMessage: "User added",
        errorMessage: "Could not add user",
    })

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

// invalidating ["users"] cascades to the open detail drawer's ["users", userId]
// query too (React Query's default prefix match), so no manual cache patch
// is needed here despite not knowing the versioned image URL until it lands
export const useUploadUserImage = () =>
    useAppMutation({
        mutationFn: uploadUserImage,
        invalidates: [usersQueryOptions().queryKey],
        successMessage: "Image updated",
        errorMessage: "Could not update image",
    })
