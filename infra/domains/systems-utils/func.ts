import { createServerFn } from "@tanstack/react-start"

export class SystemUtils {
    /**
     * get current cors configuration
     */
    getCors = createServerFn({ method: "GET" }).handler(() => {
        return { status: 200, body: "ok" }
    })
    /**
     * Get current instance details
     * like the workers memory, cpu, storage, network usage
     **/
    getDetails = createServerFn({ method: "GET" }).handler(() => {
        return { status: 200, body: "ok" }
    })
    /**
     * Helper to export data from the current database
     * to another database, can be remote or another local
     * for any databse can be d1, can be supabase, can be postgres etc
     * mongodb, redis, etc
     */
    export = createServerFn({ method: "POST" }).handler(() => {
        return { status: 200, body: "ok" }
    })
    /**
     * Helper to import data from one database
     * to the current database using the same logic as export
     * but in reverse
     */
    import = createServerFn({ method: "POST" }).handler(() => {
        return { status: 200, body: "ok" }
    })
}
