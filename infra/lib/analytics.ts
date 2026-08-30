import { env } from "cloudflare:workers"

type AuthOutcome = "success" | "failure"

type GeoInput = {
    ip?: string
    country?: string
    city?: string
    region?: string
}

export async function logAuthEvent(input: GeoInput & {
    path: string
    outcome: AuthOutcome
    email?: string
}) {
    try {
        env.EA.writeDataPoint({
            blobs: [
                "auth",
                input.path,
                input.outcome,
                input.email ?? "",
                "",
                input.ip ?? "",
                input.country ?? "",
                input.city ?? "",
                input.region ?? "",
            ],
            doubles: [1],
            indexes: [input.path],
        })
    } catch {}
}

export async function logManagementEvent(input: GeoInput & {
    action: string
    actorId: string
    targetId?: string
}) {
    try {
        env.EA.writeDataPoint({
            blobs: [
                "management",
                input.action,
                "",
                input.actorId,
                input.targetId ?? "",
                input.ip ?? "",
                input.country ?? "",
                input.city ?? "",
                input.region ?? "",
            ],
            doubles: [1],
            indexes: [input.action],
        })
    } catch {}
}
