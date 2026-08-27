import { oauthProviderAuthServerMetadata, oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider"
import defineHandler from "../utils/defineHandler"
import { auth } from "../auth"

export const wellKnownRoute = defineHandler()
    .get("/oauth-authorization-server/api/auth", async (c) => {
        return oauthProviderAuthServerMetadata(auth)(c.req.raw)
    })
    .get("/openid-configuration", async (c) => {
        return oauthProviderOpenIdConfigMetadata(auth)(c.req.raw)
    })