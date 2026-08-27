import { defineConfig } from "vite"
import { cloudflare } from "@cloudflare/vite-plugin"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import babel from "@rolldown/plugin-babel"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { minifyBuild } from "@infra/minifybuild"
import path from "node:path"

// zod v4's own external.js does an unconditional `export * as locales from
// "../locales/index.js"`, which barrel-imports all 53 translated
// error-message locales — ~170kb nothing here ever uses (we never import
// zod's `locales` export, only the schema builders). The barrel is
// re-exported via a relative specifier from inside zod itself, so a plain
// package-name alias can't intercept it — this redirects that one specific
// relative import (matched by its importer) to an empty stub instead.
function stripZodLocales() {
    const STUB_ID = "\0zod-locales-stub"
    return {
        name: "strip-zod-locales",
        enforce: "pre" as const,
        resolveId(source: string, importer: string | undefined) {
            if (
                source === "../locales/index.js" &&
                importer?.replace(/\\/g, "/").includes("/zod/v4/")
            ) {
                return STUB_ID
            }
            return undefined
        },
        load(id: string) {
            if (id === STUB_ID) return "export {}"
            return undefined
        },
    }
}

const config = defineConfig({
    server: {
        cors: false,
    },
    resolve: {
        tsconfigPaths: true,
        alias: {
            "@": path.resolve(import.meta.dirname, "."),
        },
    },
    plugins: [
        stripZodLocales(),
        cloudflare({
            viteEnvironment: {
                name: "ssr",
            },
            persistState: true,
        }),
        devtools(),
        tailwindcss(),
        tanstackStart(),
        babel({
            presets: [reactCompilerPreset()],
        }),
        viteReact(),
        minifyBuild(),
    ],
})

export default config
