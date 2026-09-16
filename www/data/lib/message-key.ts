import type { m } from "@/paraglide/messages"
import { z } from "zod"

export type MessageKey = keyof typeof m

export const messageKey = z.custom<MessageKey>(
    (value) => typeof value === "string"
)
