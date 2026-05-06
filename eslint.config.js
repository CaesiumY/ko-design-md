//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  {
    ignores: [
      ".output/**",
      "dist/**",
      "node_modules/**",
      "src/routeTree.gen.ts",
    ],
  },
  ...tanstackConfig,
]
