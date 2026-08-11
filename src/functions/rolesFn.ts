import { getCustomRoles, setCustomRoles, type CustomRole } from "@/auth/settings/roles-store"
import { getAllowedRoles, setAllowedRoles } from "@/auth/settings/access-store"
import { createServerFn } from "@tanstack/react-start"
import { queryOptions } from "@tanstack/react-query"
import { OwnerMiddleware } from "./protectionFn"

export const getCustomRolesFn = createServerFn({ method: "GET" }).handler(async () => {
    return await getCustomRoles()
})

export const updateCustomRolesFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator((data: CustomRole[]) => data)
    .handler(async ({ data }) => {
        return await setCustomRoles(data)
    })

export const customRolesQueryOptions = () =>
    queryOptions({
        queryKey: ["customRoles"],
        queryFn: () => getCustomRolesFn(),
    })

export const getAllowedRolesFn = createServerFn({ method: "GET" }).handler(async () => {
    return await getAllowedRoles()
})

export const updateAllowedRolesFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator((data: string[]) => data)
    .handler(async ({ data }) => {
        return await setAllowedRoles(data)
    })

export const allowedRolesQueryOptions = () =>
    queryOptions({
        queryKey: ["allowedRoles"],
        queryFn: () => getAllowedRolesFn(),
    })
