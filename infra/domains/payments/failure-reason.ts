type FailureReason = {
    failureCode: string
    failureMessage: string
}

export function parseFailureReason(value: string | null): FailureReason | null {
    if (!value) return null
    try {
        return JSON.parse(value)
    } catch {
        return null
    }
}
