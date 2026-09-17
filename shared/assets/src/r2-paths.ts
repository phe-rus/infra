import type { AllowedExtension } from "./constants"

export function avatarPrefix(userId: string): string {
    return `${userId}/avatar/`
}

export function filesPrefix(userId: string): string {
    return `${userId}/files/`
}

export function avatarKey(
    userId: string,
    ext: AllowedExtension
): string {
    return `${avatarPrefix(userId)}avatar.${ext}`
}

export function fileKey(
    userId: string,
    filename: string
): string {
    return `${filesPrefix(userId)}${sanitizeFilename(filename)}`
}

export function sanitizeFilename(name: string): string {
    const cleaned = name
        .replace(/[/\\]/g, "")
        .replace(/^\.+/, "")
    return cleaned.slice(-200) || "file"
}

export function stripExtension(name: string): string {
    const withoutSlashes = sanitizeFilename(name)
    const dot = withoutSlashes.lastIndexOf(".")
    return dot > 0
        ? withoutSlashes.slice(0, dot)
        : withoutSlashes
}

export async function listAllObjects(
    bucket: R2Bucket,
    prefix: string
): Promise<R2Object[]> {
    const objects: R2Object[] = []
    let cursor: string | undefined
    do {
        const result = await bucket.list({ prefix, cursor })
        objects.push(...result.objects)
        cursor = result.truncated ? result.cursor : undefined
    } while (cursor)
    return objects
}

export async function getUserUsageBytes(
    bucket: R2Bucket,
    userId: string
): Promise<number> {
    const objects = await listAllObjects(bucket, `${userId}/`)
    return objects.reduce((sum, obj) => sum + obj.size, 0)
}

export type InstanceAssetSlot = "logo" | "favicon"

// Outside the per-user prefix on purpose: an instance-wide asset isn't
// owned by whichever admin happened to upload it, so it must never count
// against that admin's own MAX_USER_QUOTA_BYTES.
export function instancePrefix(
    slot: InstanceAssetSlot
): string {
    return `instance/${slot}/`
}

// A fresh, unique filename every upload (never a fixed name reused across
// uploads), so a replaced asset always gets a new key and a stale CDN
// cached copy of the old one is never served under the new URL.
export function instanceAssetKey(
    slot: InstanceAssetSlot,
    ext: AllowedExtension
): string {
    return `${instancePrefix(slot)}${crypto.randomUUID()}.${ext}`
}
