import { revokeUserSessions } from "./revoke-user-sessions"
import { useAppMutation } from "@/kit/shared"
import { usersQueryOptions } from "./users-query-options"

export const useRevokeUserSessions = () =>
    useAppMutation({
        mutationFn: revokeUserSessions,
        invalidates: [usersQueryOptions().queryKey],
        successMessage: "All sessions revoked",
        errorMessage: "Could not revoke sessions",
    })
