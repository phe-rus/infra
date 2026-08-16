// @cloudflare/workers-types' ambient R2ListOptions is missing `include`,
// even though it's a real, supported R2 API option (confirmed against
// infra's own `wrangler types`-generated definition, which has it) —
// this fills the gap via declaration merging rather than casting it away.
export {}

declare global {
    interface R2ListOptions {
        include?: ("httpMetadata" | "customMetadata")[]
    }
}
