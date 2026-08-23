export const PAYMENT_TYPES = ["deposit", "payout", "refund"] as const
export type PaymentType = (typeof PAYMENT_TYPES)[number]

// our own simplified bucket, not a literal mirror of PawaPay's own status
// vocabulary (ACCEPTED/ENQUEUED/SUBMITTED/...) — the plugin translates
// their status into one of these when it processes a callback
export const PAYMENT_STATUSES = ["pending", "completed", "failed", "cancelled"] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const WALLET_NUMBER_STATUSES = ["pending", "verified"] as const
export type WalletNumberStatus = (typeof WALLET_NUMBER_STATUSES)[number]

export const WALLET_NUMBER_PENDING_TTL_MS = 24 * 60 * 60 * 1000

// a connected app's redirect-based checkout: created when the app requests
// one, completed/failed once the underlying deposit resolves (or the caller
// never confirms one — nothing sweeps a stale "created" intent yet)
export const PAYMENT_INTENT_STATUSES = ["created", "pending", "completed", "failed"] as const
export type PaymentIntentStatus = (typeof PAYMENT_INTENT_STATUSES)[number]
