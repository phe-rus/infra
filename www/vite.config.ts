import { defineConfig } from "vite"
import { cloudflare } from "@cloudflare/vite-plugin"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import babel from "@rolldown/plugin-babel"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { minifyBuild } from "@infra/minifybuild"
import path from "node:path"

const config = defineConfig({
    resolve: {
        tsconfigPaths: true,
        alias: {
            "@": path.resolve(import.meta.dirname, "./src"),
        },
    },
    plugins: [
        cloudflare({
            viteEnvironment: {
                name: "ssr",
            },
            persistState: true,
        }),
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
