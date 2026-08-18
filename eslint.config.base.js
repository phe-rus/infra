// shared rule overrides for every workspace package's eslint.config.js —
// see each package's own config for its package-specific `ignores`
export const sharedRules = {
    "import/no-cycle": "off",
    "import/order": "off",
    "sort-imports": "off",
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/require-await": "off",
    "pnpm/json-enforce-catalog": "off",
}
