import { createResendSender } from "./providers/resend"
import { createEmailHooks } from "./hooks"
import type { EmailHooks } from "./hooks"
import type { NotifyOptions, SendEmailOptions } from "./types"

export type {
    NotifyOptions,
    EmailScope,
    ResendOptions,
    EmailUser,
} from "./types"
export type { EmailHooks } from "./hooks"
export {
    verificationEmailHtml,
    resetPasswordEmailHtml,
    deleteAccountEmailHtml,
    layout,
    tableRow,
    COLORS,
} from "./templates"

export type NotifyInstance = {
    /** better-auth plugin id — looked up via ctx.context.getPlugin("notify")
     *  (from other plugins, e.g. @infra/payprovider) or by scanning the
     *  `plugins` array directly (e.g. shared/auth's createAuth). Nothing
     *  else is contributed to the better-auth plugin surface yet, but kept
     *  real (registerable in `plugins: []`) so a push provider or its own
     *  endpoints can be added here later without a redesign. */
    id: "notify"
    /** The 3 better-auth-shaped callbacks — spread into
     *  emailAndPassword/emailVerification/user.deleteUser by the app. A
     *  kind not in `scope` (or the whole plugin disabled) comes back
     *  undefined, which better-auth already treats as "not configured".
     *  Named emailHooks, not `hooks` — that name is reserved by
     *  BetterAuthPlugin's own before/after middleware hooks and this type
     *  needs to structurally satisfy that interface to live in `plugins`. */
    emailHooks: EmailHooks
    /** Generic "send an email" primitive for anything that isn't one of
     *  the 3 built-in flows — e.g. a future support-ticket confirmation.
     *  Throws clearly if the plugin is disabled/unconfigured rather than
     *  silently doing nothing. */
    send: (data: SendEmailOptions) => Promise<void>
}

export function notify(options: NotifyOptions): NotifyInstance {
    const configured = options.enable && Boolean(options.resend)
    const send = configured
        ? createResendSender(options.resend!)
        : async () => {
              throw new Error(
                  "@infra/notify is not configured on this instance (enable: false, or missing `resend` options)"
              )
          }

    return {
        id: "notify",
        emailHooks: configured ? createEmailHooks(options, send) : {},
        send,
    }
}
