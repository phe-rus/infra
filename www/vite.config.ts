import { defineConfig } from "vite"
import { cloudflare } from "@cloudflare/vite-plugin"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { paraglideVitePlugin } from "@inlang/paraglide-js"
import babel from "@rolldown/plugin-babel"
import viteReact, {
    reactCompilerPreset,
} from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { minifyBuild } from "@infra/minifybuild"
import path from "node:path"

const config = defineConfig({
    resolve: {
        tsconfigPaths: true,
        alias: {
            "@": path.resolve(import.meta.dirname, "."),
        },
    },
    plugins: [
        cloudflare({
            viteEnvironment: {
                name: "ssr",
            },
            persistState: true,
        }),
        devtools(),
        tailwindcss(),
        paraglideVitePlugin({
            project: path.resolve(
                import.meta.dirname,
                "./project.inlang"
            ),
            outdir: path.resolve(
                import.meta.dirname,
                "./src/paraglide"
            ),
            outputStructure: "message-modules",
            cookieName: "PARAGLIDE_LOCALE",
            strategy: [
                "url",
                "cookie",
                "preferredLanguage",
                "baseLocale",
            ],
            emitTsDeclarations: true,
        }),
        tanstackStart(),
        babel({
            presets: [reactCompilerPreset()],
        }),
        viteReact(),
        minifyBuild(),
    ],
})

export default config
