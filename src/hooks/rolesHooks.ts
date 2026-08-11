import {
    allowedRolesQueryOptions,
    customRolesQueryOptions,
    updateAllowedRolesFn,
    updateCustomRolesFn,
} from "@/functions/rolesFn"
import type { CustomRole } from "@/auth/settings/roles-store"
import { useMutation } from "@tanstack/react-query"
import { getContext } from "@/lib/queryClient"
import { t } from "@/components/ui/sonner"

type TeamRolesInput = {
    customRoles: CustomRole[]
    allowedRoles: string[]
}

export const useUpdateTeamRoles = () => {
    const q = getContext()
    return useMutation({
        mutationFn: (data: TeamRolesInput) =>
            Promise.all([
                updateCustomRolesFn({ data: data.customRoles }),
                updateAllowedRolesFn({ data: data.allowedRoles }),
            ]),
        onSuccess: () => {
            t.success("Roles saved", {
                description: "Changes take effect the next time this instance restarts.",
            })
            q.invalidateQueries(customRolesQueryOptions())
            q.invalidateQueries(allowedRolesQueryOptions())
        },
        onError: (error) => {
            t.error("Could not save roles", { description: error.message })
        },
    })
}
