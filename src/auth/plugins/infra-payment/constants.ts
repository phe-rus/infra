export const PAYMENT_TYPES = ["deposit", "payout", "refund"] as const
export type PaymentType = (typeof PAYMENT_TYPES)[number]

// our own simplified bucket, not a literal mirror of PawaPay's own status
// vocabulary (ACCEPTED/ENQUEUED/SUBMITTED/...) — the plugin translates
// their status into one of these when it processes a callback
export const PAYMENT_STATUSES = ["pending", "completed", "failed", "cancelled"] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]
