import { readFileSync } from "node:fs"
import path from "node:path"
import type { Plugin } from "vite"

const NODE_ENV_CHECK = /process\.env\.NODE_ENV/
const PROD_REQUIRE =
    /require\(\s*["']([^"']*production[^"']*)["']\s*\)/i
const DEV_REQUIRE =
    /require\(\s*["']([^"']*development[^"']*)["']\s*\)/i
// the dev/prod switcher files this targets (react, react-dom, scheduler,
// and anything else following the same convention) are a handful of lines
// — anything bigger than this is a real module, not a switcher, and not
// worth reading just to find out
const MAX_WRAPPER_SIZE = 4096

export type MinifyBuildOptions = {
    /**
     * Many CJS packages ship an entry file that picks a dev or production
     * build via a runtime `process.env.NODE_ENV === "production"` check
     * wrapped around two `require()` calls — react, react-dom, and
     * scheduler all do this. Rolldown doesn't eliminate the dead branch of
     * that check the way classic Rollup/esbuild do (a known upstream
     * limitation, not specific to any one package: rolldown/rolldown#3410),
     * so both builds end up shipped. Enabled by default: resolves straight
     * to the production file during a production build, for any package
     * that uses the convention — detected by content shape, not by package
     * name, so it isn't a list to maintain by hand.
     */
    stripEnvConditionals?: boolean
}

export function minifyBuild(options: MinifyBuildOptions = {}): Plugin {
    const { stripEnvConditionals = true } = options
    let isProd = false
    return {
        name: "infra:minify-build",
        // must win the resolveId race against other plugins (Cloudflare's,
        // React's, TanStack Start's) that would otherwise resolve these
        // bare specifiers first and never give this plugin a chance to run
        enforce: "pre",
        configResolved(config) {
            isProd = config.mode === "production"
        },
        async resolveId(source, importer, resolveOptions) {
            if (!stripEnvConditionals || !isProd || !importer)
                return null

            const resolved = await this.resolve(source, importer, {
                ...resolveOptions,
                skipSelf: true,
            })
            if (!resolved || resolved.external) return null
            if (!resolved.id.includes("node_modules")) return null
            if (!/\.[cm]?js$/.test(resolved.id)) return null

            let content: string
            try {
                content = readFileSync(resolved.id, "utf8")
            } catch {
                return null
            }
            if (
                content.length > MAX_WRAPPER_SIZE ||
                !NODE_ENV_CHECK.test(content)
            )
                return null

            const prodMatch = content.match(PROD_REQUIRE)
            const devMatch = content.match(DEV_REQUIRE)
            if (!prodMatch || !devMatch) return null

            const prodTarget = path.resolve(
                path.dirname(resolved.id),
                prodMatch[1]
            )
            return this.resolve(prodTarget, resolved.id, {
                skipSelf: true,
            })
        },
    }
}
