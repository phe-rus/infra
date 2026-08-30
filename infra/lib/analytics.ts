import { env } from "cloudflare:workers"

type AuthOutcome = "success" | "unknown"

export function logAuthEvent(input: {
    path: string
    outcome: AuthOutcome
    country?: string
    region?: string
}) {
    try {
        env.EA.writeDataPoint({
            blobs: [input.path, input.outcome, input.country ?? "", input.region ?? ""],
            doubles: [1],
            indexes: [input.path],
        })
    } catch {}
}

export function logManagementEvent(input: {
    action: string
    actorId: string
    targetId?: string
}) {
    try {
        env.EM.writeDataPoint({
            blobs: [input.action, input.actorId, input.targetId ?? ""],
            doubles: [1],
            indexes: [input.action],
        })
    } catch {}
}
