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
]
