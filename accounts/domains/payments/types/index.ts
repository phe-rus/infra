import { z } from "zod"

export const payIntentSearchSchema = z.object({ intent: z.string() })

export const paymentIntentIdSchema = z.object({ id: z.string() })
