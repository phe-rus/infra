import {
    getAllowedRolesFn,
    getCustomRolesFn,
    updateAllowedRolesFn,
    updateCustomRolesFn,
} from "@/functions/rolesFn"
import type { z } from "zod"
import type { teamRolesSchema } from "@/schemas/team-roles"
import { useAppMutation } from "@/hooks/useAppMutation"
import { queryOptions } from "@tanstack/react-query"

export const customRolesQueryOptions = () =>
    queryOptions({
        queryKey: ["customRoles"],
        queryFn: () => getCustomRolesFn(),
    })

export const allowedRolesQueryOptions = () =>
    queryOptions({
        queryKey: ["allowedRoles"],
        queryFn: () => getAllowedRolesFn(),
    })

type TeamRolesInput = z.infer<typeof teamRolesSchema>

export const useUpdateTeamRoles = () =>
    useAppMutation({
        mutationFn: (data: TeamRolesInput) =>
            Promise.all([
                updateCustomRolesFn({ data: data.customRoles }),
                updateAllowedRolesFn({ data: data.allowedRoles }),
            ]),
        invalidates: [customRolesQueryOptions().queryKey, allowedRolesQueryOptions().queryKey],
        successMessage: "Roles saved",
        successDescription: "Changes take effect the next time this instance restarts.",
        errorMessage: "Could not save roles",
    })
