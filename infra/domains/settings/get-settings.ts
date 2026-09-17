import { queryOptions } from "@tanstack/react-query"
import { getInstanceSettings } from "./func"

export const instanceSettingsOptions = () =>
    queryOptions({
        queryKey: ["instance-settings"],
        queryFn: () => getInstanceSettings(),
    })
