import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access"

export const ac = createAccessControl(defaultStatements)

export const roles = {
    user: ac.newRole({}),
    owner: ac.newRole({ ...adminAc.statements }),
}
