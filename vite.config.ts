import { existsSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import type { Plugin, UserConfig } from "vite"

const IGNORED_ROLLUP_WARNING_CODES = new Set([
  "EVAL",
  "CIRCULAR_DEPENDENCY",
  "THIS_IS_UNDEFINED",
  "EMPTY_BUNDLE",
])

type RollupOptions = NonNullable<
  NonNullable<UserConfig["build"]>["rollupOptions"]
>

const onRollupWarn: NonNullable<RollupOptions["onwarn"]> = (warning, warn) => {
  if (warning.code && IGNORED_ROLLUP_WARNING_CODES.has(warning.code)) {
    return
  }
  if (
    warning.code === "MODULE_LEVEL_DIRECTIVE" &&
    warning.id?.includes("node_modules")
  ) {
    return
  }
  warn(warning)
}

function manualVendorChunk(id: string): string | undefined {
  if (!id.includes("node_modules")) return undefined
  if (
    id.includes("/node_modules/react/") ||
    id.includes("/node_modules/react-dom/") ||
    id.includes("/node_modules/scheduler/") ||
    id.includes("/node_modules/use-sync-external-store/")
  ) {
    return "vendor-react"
  }
  if (id.includes("/node_modules/@tanstack/")) return "vendor-tanstack"
  if (
    id.includes("/node_modules/@base-ui/") ||
    id.includes("/node_modules/@floating-ui/") ||
    id.includes("/node_modules/lucide-react/")
  ) {
    return "vendor-ui"
  }
  if (
    id.includes("/node_modules/shiki/") ||
    id.includes("/node_modules/@shikijs/") ||
    id.includes("/node_modules/oniguruma-to-es/")
  ) {
    return "vendor-shiki"
  }
  return "vendor-misc"
}

const appRollupOptions = {
  onwarn: onRollupWarn,
  output: {
    manualChunks: manualVendorChunk,
  },
} satisfies RollupOptions

const nitroRollupOptions = {
  onwarn: onRollupWarn,
} satisfies RollupOptions

const PREVIEW_SLUGS_MODULE_ID = "virtual:preview-slugs"
const RESOLVED_PREVIEW_SLUGS_MODULE_ID = `\0${PREVIEW_SLUGS_MODULE_ID}`

function getPreviewDir(root: string): string {
  return join(root, "public", "preview")
}

function readPreviewSlugs(root: string): Array<string> {
  const previewDir = getPreviewDir(root)
  if (!existsSync(previewDir)) return []

  return readdirSync(previewDir, { withFileTypes: true })
    .filter((entry) => {
      if (!entry.isDirectory() || entry.name.startsWith("_")) return false
      return existsSync(join(previewDir, entry.name, "light.html"))
    })
    .map((entry) => entry.name)
    .sort()
}

function previewSlugsPlugin(): Plugin {
  let root = process.cwd()

  return {
    name: "preview-slugs",
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      if (id === PREVIEW_SLUGS_MODULE_ID) return RESOLVED_PREVIEW_SLUGS_MODULE_ID
      return null
    },
    load(id) {
      if (id !== RESOLVED_PREVIEW_SLUGS_MODULE_ID) return null

      const previewDir = getPreviewDir(root)
      const slugs = readPreviewSlugs(root)
      if (existsSync(previewDir)) {
        for (const slug of slugs) {
          this.addWatchFile(join(previewDir, slug, "light.html"))
        }
      }

      return `export const previewSlugs = ${JSON.stringify(slugs)};\n`
    },
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url))

const config = defineConfig({
  resolve: {
    // Native tsconfig path alias resolution (vite >= 8). Replaces the
    // previous `vite-tsconfig-paths` plugin — vite auto-discovers the root
    // `tsconfig.json` and honors the `paths` field (`@/* → ./src/*`).
    tsconfigPaths: true,
    // Explicit alias fallback for environments where the native resolver
    // does not apply (notably vitest's SSR worker). Keeps `@/...` imports
    // working uniformly across dev / build / test.
    alias: {
      "@": join(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: appRollupOptions,
  },
  plugins: [
    previewSlugsPlugin(),
    devtools(),
    nitro({ rollupConfig: nitroRollupOptions }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
