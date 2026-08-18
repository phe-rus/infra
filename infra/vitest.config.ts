import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
        alias: {
            "@": path.resolve(import.meta.dirname, "./src"),
        },
    },
    test: {
        environment: "node",
        include: ["tests/**/*.test.ts"],
    },
})
