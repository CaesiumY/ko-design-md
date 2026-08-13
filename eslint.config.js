//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

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
