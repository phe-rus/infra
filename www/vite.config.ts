import { defineConfig } from "vite"
import { cloudflare } from "@cloudflare/vite-plugin"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import path from "path"

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  plugins: [
    cloudflare({
      viteEnvironment: {
        name: "ssr"
      },
      persistState: true
    }),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
