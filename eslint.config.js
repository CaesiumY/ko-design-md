//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"
import reactHooks from "eslint-plugin-react-hooks"

export default [
  {
    ignores: [
      ".output/**",
      ".agents/**",
      ".claude/**",
      ".codex/**",
      "dist/**",
      "node_modules/**",
      "public/preview/**",
      "src/routeTree.gen.ts",
    ],
  },
  ...tanstackConfig,
  // The React Compiler (vite.config.ts) silently skips code that breaks the
  // Rules of React; these rules surface that at lint time instead.
  {
    ...reactHooks.configs.flat.recommended,
    files: ["src/**/*.{ts,tsx}"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSUnknownKeyword",
          message:
            "Use a concrete type. `unknown` is only allowed at declared external-input boundaries.",
        },
      ],
    },
  },
]
