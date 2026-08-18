import { authClient } from "@/lib/auth-client"
import { useAppMutation } from "@infra/ui/hooks/use-app-mutation"
import { sessionsOptions } from "./get-sessions"

export const useRevokeSession = () =>
    useAppMutation({
        mutationFn: async (token: string) => {
            const { error } = await authClient.revokeSession({ token })
            if (error) throw new Error(error.message ?? "Could not sign out that session")
        },
        invalidates: [sessionsOptions().queryKey],
        successMessage: "Session signed out",
        errorMessage: "Could not sign out that session",
    })
