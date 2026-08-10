import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access"
import type { CustomRole } from "./settings/roles-store"

export const ac = createAccessControl(defaultStatements)

export const FIXED_ROLE_NAMES = ["owner", "admin", "user"] as const

export const PERMISSION_STATEMENTS: { user: string[]; session: string[] } = {
    user: [...defaultStatements.user],
    session: [...defaultStatements.session],
}

const PERMISSION_LABELS: Record<string, string> = {
    create: "Create users",
    list: "List",
    "set-role": "Change roles",
    ban: "Ban / unban",
    impersonate: "Impersonate users",
    "impersonate-admins": "Impersonate admins",
    delete: "Delete",
    "set-password": "Set password",
    "set-email": "Set email",
    get: "View details",
    update: "Update",
    revoke: "Revoke",
}

export function permissionLabel(action: string): string {
    return PERMISSION_LABELS[action] ?? action
}

export function buildRoles(customRoles: CustomRole[]) {
    const fixed = {
        owner: ac.newRole({ ...adminAc.statements }),
        admin: ac.newRole({ ...adminAc.statements }),
        user: ac.newRole({}),
    }
    const custom = Object.fromEntries(
        customRoles.map((role) => [
            role.name,
            ac.newRole(role.permissions as Parameters<typeof ac.newRole>[0]),
        ])
    )
    return { ...fixed, ...custom }
}
