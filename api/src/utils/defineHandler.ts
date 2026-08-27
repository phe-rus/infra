import { createFactory } from "hono/factory"
import type { AppTypes } from "../types"

export const factory = createFactory<AppTypes>()
const defineHandler = () => {
    return factory.createApp()
}

export default defineHandler