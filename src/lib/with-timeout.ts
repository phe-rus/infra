export function withTimeout<TFn extends (opts?: any) => Promise<any>>(fn: TFn, ms = 15000): TFn {
    return ((opts?: Parameters<TFn>[0]) => fn({ ...(opts ?? {}), signal: AbortSignal.timeout(ms) })) as TFn
}
