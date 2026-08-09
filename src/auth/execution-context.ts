import { AsyncLocalStorage } from "node:async_hooks"

export const execCtxStorage = new AsyncLocalStorage<ExecutionContext>()
