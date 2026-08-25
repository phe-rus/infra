import { useSuspenseQuery } from "@tanstack/react-query"
import { statsOptions } from "./get-stats"

export const useStats = () => useSuspenseQuery(statsOptions())
