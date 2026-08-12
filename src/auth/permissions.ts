import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access"

export const ac = createAccessControl(defaultStatements)
export const FIXED_ROLE_NAMES = ["owner", "admin", "user"] as const
export function isAdminTier(role: string): boolean {
    return role === "owner" || role === "admin"
}
export function isOwner(role: string): boolean {
    return role === "owner"
}
export function buildRoles() {
    return {
        owner: ac.newRole({ ...adminAc.statements }),
        admin: ac.newRole({ ...adminAc.statements }),
        user: ac.newRole({}),
    }
}
