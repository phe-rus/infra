export const MAX_FILE_BYTES = 2 * 1024 * 1024
export const MAX_USER_QUOTA_BYTES = 5 * 1024 * 1024

export const IMAGE_TYPES = {
    png: "image/png",
    webp: "image/webp",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    svg: "image/svg+xml",
} as const

export const DOC_TYPES = {
    pdf: "application/pdf",
    json: "application/json",
} as const

export const ALLOWED_TYPES = { ...IMAGE_TYPES, ...DOC_TYPES }

export type AllowedExtension = keyof typeof ALLOWED_TYPES
export type AllowedImageExtension = keyof typeof IMAGE_TYPES
