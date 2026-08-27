import { defineConfig } from "vite"
import { cloudflare } from "@cloudflare/vite-plugin"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import babel from "@rolldown/plugin-babel"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { minifyBuild } from "@infra/minifybuild"
import path from "node:path"

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
