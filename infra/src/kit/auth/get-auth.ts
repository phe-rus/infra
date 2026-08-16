import { queryOptions } from "@tanstack/react-query"
import { getConsentClient, getSession, getSetupStatus } from "./fnc"

export const meQueryOptions = () =>
    queryOptions({
        queryKey: ["me"],
        queryFn: () => getSession(),
    })

export const setupStatusQueryOptions = () =>
    queryOptions({
        queryKey: ["setup"],
        queryFn: () => getSetupStatus(),
    })

export const consentClientQueryOptions = (clientId: string) =>
    queryOptions({
        queryKey: ["consent-client", clientId],
        queryFn: () => getConsentClient({ data: { clientId } }),
    })
