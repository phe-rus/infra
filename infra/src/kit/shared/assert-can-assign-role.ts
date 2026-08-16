export function assertCanAssignRole(actorRole: string, role: "owner" | "admin" | "user") {
    if (actorRole !== "owner" && role !== "user") {
        throw new Error("Only an owner can create admin or owner accounts")
    }
}
