import { getLocale } from "@/src/paraglide/runtime"
import en from "./dictionaries/en.json"
import fr from "./dictionaries/fr.json"
import zh from "./dictionaries/zh.json"

export const dictionaries = { en, zh, fr }
export type Dictionary = typeof en
export function getDictionary(): Dictionary {
    return dictionaries[getLocale()]
}
