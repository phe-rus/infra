//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"
import { sharedRules } from "../eslint.config.base.js"

export default [
    ...tanstackConfig,
    {
        rules: sharedRules,
    },
    {
        ignores: ["eslint.config.js", ".prettierrc", "worker-configuration.d.ts", "src/routeTree.gen.ts"],
    },
]
