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
  // These files decode untyped values at an application boundary. Every other
  // source file must model data with a concrete type instead of `unknown`.
  {
    files: [
      "src/lib/content-collection.ts",
      "src/lib/content-parser.ts",
      "src/routes/index.tsx",
      "src/routes/services/$slug.tsx",
    ],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
]
