import type { ListedUser, UsersListData } from "@/kit/types"

export function patchUserInCache(
    old: UsersListData | undefined,
    userId: string,
    patch: Partial<ListedUser>
): UsersListData {
    if (!old) return { users: [], total: 0 }
    return { ...old, users: old.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)) }
}
