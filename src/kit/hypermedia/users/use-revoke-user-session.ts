import { revokeUserSession } from "./revoke-user-session"
import { useAppMutation } from "@/kit/shared"
import { usersQueryOptions } from "./users-query-options"

export const useRevokeUserSession = () =>
    useAppMutation({
        mutationFn: revokeUserSession,
        invalidates: [usersQueryOptions().queryKey],
        successMessage: "Session revoked",
        errorMessage: "Could not revoke session",
    })
