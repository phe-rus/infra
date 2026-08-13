import { generateRandomString } from "better-auth/crypto"
import { REGISTRATION_SECRET_LENGTH } from "./constants"

function toHex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function generateRegistrationSecret(): string {
    return generateRandomString(REGISTRATION_SECRET_LENGTH, "a-z", "A-Z", "0-9")
}

// a random high-entropy secret doesn't need a slow KDF (that's for
// defending low-entropy human passwords, see auth/password.ts) — a fast
// hash is appropriate and far cheaper
export async function hashSecret(secret: string): Promise<string> {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret))
    return toHex(digest)
}
