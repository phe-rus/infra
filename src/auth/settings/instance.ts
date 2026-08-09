import { env } from "cloudflare:workers"

const APP_NAME_KEY = "app-name"
const DEFAULT_APP_NAME = "Infra"

export async function getAppName(): Promise<string> {
    return (await env.SET.get(APP_NAME_KEY)) ?? DEFAULT_APP_NAME
}

export async function setAppName(name: string) {
    await env.SET.put(APP_NAME_KEY, name)
}
