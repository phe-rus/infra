import { createServerFn } from "@tanstack/react-start"

export const cors = createServerFn({ method: "GET" })
    .handler(() => {
        return { status: 200, body: "ok" }
    })

export const details = createServerFn({ method: "GET" })
    .handler(() => {
        const runtime = 'workers'
        const appName = process.env.VITE_APPNAME

        return {
            app: {
                name: appName,
                version: '1.4.7'
            },
            runtime: {
                env: 'production',
                name: runtime,
            }
        }
    })