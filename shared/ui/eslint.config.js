//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"
import { sharedRules } from "../../eslint.config.base.js"

export default [
    ...tanstackConfig,
    {
        rules: sharedRules,
    },
    {
        // shadcn-generated primitives — regenerated via `bunx shadcn add`,
        // never hand-edited (see infra/CLAUDE.md), so not held to this
        // project's own naming/shadow/conditional conventions
        files: ["src/components/**"],
        rules: {
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "no-shadow": "off",
        },
    },
    {
        ignores: ["eslint.config.js", ".prettierrc"],
    },
]
