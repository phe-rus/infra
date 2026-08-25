import { APIError } from "better-auth/api"

export function assertOwnsApp(
    appUserId: string | null,
    callerId: string,
    action: string
): void {
    if (appUserId !== null && appUserId !== callerId) {
        throw new APIError("FORBIDDEN", {
            message: `Only the admin who created this application can ${action}`,
        })
    }
}
