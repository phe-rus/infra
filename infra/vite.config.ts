import { defineConfig } from "vite"
import { cloudflare } from "@cloudflare/vite-plugin"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import babel from "@rolldown/plugin-babel"
import viteReact, {
    reactCompilerPreset,
} from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { minifyBuild } from "@infra/minifybuild"
import path from "node:path"

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
    build: {
        target: "esnext",
        cssCodeSplit: true,
        rollupOptions: {
            external: ['@node-rs/argon2', 'better-auth'],
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules/recharts")) {
                        return "vendor-recharts"
                    }
                    if (id.includes("node_modules/date-fns") || id.includes("node_modules/dayjs")) {
                        return "vendor-dates"
                    }
                },
            },
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
