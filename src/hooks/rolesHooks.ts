import {
    getAllowedRolesFn,
    getCustomRolesFn,
    updateAllowedRolesFn,
    updateCustomRolesFn,
} from "@/functions/rolesFn"
import type { z } from "zod"
import type { teamRolesSchema } from "@/schemas/team-roles"
import { settleAll, useAppMutation } from "@/hooks/useAppMutation"
import { queryOptions } from "@tanstack/react-query"
import { withTimeout } from "@/lib/with-timeout"

export const customRolesQueryOptions = () =>
    queryOptions({
        queryKey: ["customRoles"],
        queryFn: () => withTimeout(getCustomRolesFn)(),
    })

export const allowedRolesQueryOptions = () =>
    queryOptions({
        queryKey: ["allowedRoles"],
        queryFn: () => withTimeout(getAllowedRolesFn)(),
    })

type TeamRolesInput = z.infer<typeof teamRolesSchema>

export const useUpdateTeamRoles = () =>
    useAppMutation({
        mutationFn: (data: TeamRolesInput) =>
            settleAll([
                () => withTimeout(updateCustomRolesFn)({ data: data.customRoles }),
                () => withTimeout(updateAllowedRolesFn)({ data: data.allowedRoles }),
            ]),
        invalidates: [customRolesQueryOptions().queryKey, allowedRolesQueryOptions().queryKey],
        successMessage: "Roles saved",
        successDescription: "Changes take effect the next time this instance restarts.",
        errorMessage: "Could not save roles",
    })
