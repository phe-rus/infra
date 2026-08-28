import { defineConfig } from "vite"
import { cloudflare } from "@cloudflare/vite-plugin"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import babel from "@rolldown/plugin-babel"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { minifyBuild } from "@infra/minifybuild"
import path from "node:path"

const config = defineConfig({
    server: {
        cors: true
    },
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
        tanstackStart(),
        babel({
            presets: [reactCompilerPreset()],
        }),
        viteReact(),
        minifyBuild(),
    ],
})

export default config
