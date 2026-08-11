import { getCustomRoles, setCustomRoles } from "@/auth/settings/roles-store"
import type { CustomRole } from "@/types"
import { getAllowedRoles, setAllowedRoles } from "@/auth/settings/access-store"
import { createServerFn } from "@tanstack/react-start"
import { OwnerMiddleware } from "@/middleware/owner-middleware"

export const getCustomRolesFn = createServerFn({ method: "GET" }).handler(async () => {
    return await getCustomRoles()
})

export const updateCustomRolesFn = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator((data: CustomRole[]) => data)
    .handler(async ({ data }) => {
        return await setCustomRoles(data)
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
