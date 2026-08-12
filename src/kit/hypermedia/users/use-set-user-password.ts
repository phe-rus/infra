import { setUserPassword } from "./set-user-password"
import { useAppMutation } from "@/kit/shared"

export const useSetUserPassword = () =>
    useAppMutation({
        mutationFn: setUserPassword,
        successMessage: "Password updated",
        errorMessage: "Could not set password",
    })
