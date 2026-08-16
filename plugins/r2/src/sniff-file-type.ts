import type { AllowedExtension, AllowedImageExtension } from "./constants"
import { IMAGE_TYPES } from "./constants"

function bytesStartWith(bytes: Uint8Array, prefix: number[], offset = 0): boolean {
    if (bytes.length < offset + prefix.length) return false
    return prefix.every((byte, i) => bytes[offset + i] === byte)
}

export function sniffExtension(bytes: Uint8Array): AllowedExtension | null {
    if (bytesStartWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png"
    if (bytesStartWith(bytes, [0xff, 0xd8, 0xff])) return "jpg"
    if (bytesStartWith(bytes, [0x52, 0x49, 0x46, 0x46]) && bytesStartWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
        return "webp"
    }
    if (bytesStartWith(bytes, [0x25, 0x50, 0x44, 0x46])) return "pdf"

    const text = new TextDecoder().decode(bytes.subarray(0, Math.min(bytes.length, 512))).trimStart()
    if (/^(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(text)) return "svg"

    try {
        JSON.parse(new TextDecoder().decode(bytes))
        return "json"
    } catch {
        return null
    }
}

export function isImageExtension(ext: AllowedExtension): ext is AllowedImageExtension {
    return ext in IMAGE_TYPES
}
