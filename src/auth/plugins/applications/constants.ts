export const APP_TYPES = ["mobile", "web", "cli", "desktop", "other"] as const
export type AppType = (typeof APP_TYPES)[number]

export const APP_STATUSES = ["unverified", "verified", "locked"] as const
export type AppStatus = (typeof APP_STATUSES)[number]

export const REGISTRATION_SECRET_LENGTH = 40
