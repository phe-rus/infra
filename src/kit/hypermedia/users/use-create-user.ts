import { createUser } from "./create-user"
import { useAppMutation } from "@/kit/shared"
import { usersQueryOptions } from "./users-query-options"

export const useCreateUser = () =>
    useAppMutation({
        mutationFn: createUser,
        invalidates: [usersQueryOptions().queryKey],
        successMessage: "User added",
        errorMessage: "Could not add user",
    })
