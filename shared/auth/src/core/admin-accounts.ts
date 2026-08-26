import {
    createAuthEndpoint,
    sessionMiddleware,
    APIError,
} from "better-auth/api"
import * as z from "zod"
import type { BetterAuthPlugin } from "better-auth/types"

type ListUserAccountsOptions = {
    isAdmin: (role: string) => boolean
}

export const listUserAccounts = ({
    isAdmin,
}: ListUserAccountsOptions) =>
    ({
        id: "list-user-accounts",
        endpoints: {
            listUserAccounts: createAuthEndpoint(
                "/admin/list-accounts",
                {
                    method: "GET",
                    use: [sessionMiddleware],
                    query: z.object({ userId: z.string() }),
                },
                async (ctx) => {
                    if (!isAdmin(ctx.context.session.user.role ?? "")) {
                        throw new APIError("FORBIDDEN", {
                            message: "Admin access required",
                        })
                    }

                    const accounts =
                        await ctx.context.internalAdapter.findAccounts(
                            ctx.query.userId
                        )
                    return ctx.json({
                        accounts: accounts.map(
                            ({
                                id,
                                issuer,
                                providerId,
                                accountId,
                                userId,
                                createdAt,
                                updatedAt,
                                scope,
                            }) => ({
                                id,
                                issuer,
                                providerId,
                                accountId,
                                userId,
                                createdAt,
                                updatedAt,
                                scopes: scope ? scope.split(" ") : [],
                            })
                        ),
                    })
                }
            ),
        },
    }) satisfies BetterAuthPlugin
