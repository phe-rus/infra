// a plugin-added model gets no automatic id/createdAt/updatedAt columns —
// only better-auth's own core models do (confirmed live with the old
// applications plugin, same gotcha applies here) — id is still implicit,
// but createdAt/updatedAt need declaring explicitly or they won't exist
export const schema = {
    payment: {
        fields: {
            userId: {
                type: "string",
                required: true,
                references: { model: "user", field: "id" },
                index: true,
            },
            // which connected OAuth app requested this payment — nullable,
            // a dashboard-initiated payout has no requesting client
            clientId: {
                type: "string",
                required: false,
                references: { model: "oauthClient", field: "clientId" },
                index: true,
            },
            type: {
                type: "string", // PaymentType: "deposit" | "payout" | "refund"
                required: true,
            },
            // mobile money correspondent code (e.g. MTN_MOMO_ZMB) —
            // PawaPay's vocabulary, stored as-is rather than re-enumerated
            provider: {
                type: "string",
                required: false,
            },
            phoneNumber: {
                type: "string",
                required: false,
            },
            // decimal string, not a float — avoids precision issues the
            // same way PawaPay's own API represents amounts as strings
            amount: {
                type: "string",
                required: true,
            },
            currency: {
                type: "string",
                required: true,
            },
            // PawaPay's own deposit/payout/refund id — how a callback gets
            // matched back to this row
            pawapayReferenceId: {
                type: "string",
                required: true,
                unique: true,
                index: true,
            },
            status: {
                type: "string", // PaymentStatus
                required: true,
                defaultValue: "pending",
            },
            failureReason: {
                type: "string",
                required: false,
            },
            // JSON-stringified, same pattern as oauthClient's own metadata
            // column — whatever purpose/order-reference the connecting
            // platform attached to this payment
            metadata: {
                type: "string",
                required: false,
            },
            createdAt: {
                type: "date",
                required: true,
                defaultValue: () => new Date(),
            },
            updatedAt: {
                type: "date",
                required: true,
                defaultValue: () => new Date(),
                onUpdate: () => new Date(),
            },
        },
    },
    // a user's saved mobile-money numbers — separate from `payment.phoneNumber`,
    // which is per-transaction. Self-service only, no admin surface reads this
    walletNumber: {
        fields: {
            userId: {
                type: "string",
                required: true,
                references: { model: "user", field: "id" },
                index: true,
            },
            phoneNumber: {
                type: "string",
                required: true,
            },
            // mobile money correspondent code, same vocabulary as
            // `payment.provider` (e.g. MTN_MOMO_ZMB)
            provider: {
                type: "string",
                required: true,
            },
            label: {
                type: "string",
                required: false,
            },
            // "pending" until a real deposit clears through this exact
            // phoneNumber+provider, then "verified" for good — only a
            // verified number can be pinned primary. A pending one that
            // never gets used is swept on the next /pay/wallets read once
            // it's older than 24h (see listWalletNumbers)
            status: {
                type: "string",
                required: true,
                defaultValue: "pending",
            },
            isPrimary: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },
            createdAt: {
                type: "date",
                required: true,
                defaultValue: () => new Date(),
            },
            updatedAt: {
                type: "date",
                required: true,
                defaultValue: () => new Date(),
                onUpdate: () => new Date(),
            },
        },
    },
} as const
