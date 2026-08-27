import { waitUntil } from "cloudflare:workers"

export function sendInBackground(promise: Promise<unknown>): void {
    waitUntil(
        promise.catch((error) => {
            console.error("[notify] background send failed:", error)
        })
    )
}
