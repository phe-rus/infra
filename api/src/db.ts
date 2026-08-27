import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2"
import * as authSchemas from "./schemas/auth"
import { drizzle } from "drizzle-orm/d1"
import { env } from "./utils/envs"

export const db = drizzle(env.D1, {
    relations: {
        ...authSchemas.authRelations,
    }
})

export const dbContext = () => {
    return drizzleAdapter(db, {
        provider: 'sqlite',
        camelCase: true,
        schema: authSchemas
    })
}