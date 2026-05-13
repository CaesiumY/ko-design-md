import { existsSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import type { Plugin } from "vite"

const PREVIEW_MANIFEST_MODULE_ID = "virtual:preview-manifest"
const RESOLVED_PREVIEW_MANIFEST_MODULE_ID = `\0${PREVIEW_MANIFEST_MODULE_ID}`

function readPreviewSlugs(root: string): Array<string> {
  const previewRoot = resolve(root, "public", "preview")

  try {
    return readdirSync(previewRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((slug) => existsSync(resolve(previewRoot, slug, "light.html")))
      .sort((a, b) => a.localeCompare(b))
  } catch {
    return []
  }
}

function previewManifestPlugin(): Plugin {
  let root = process.cwd()

  return {
    name: "ko-design-md-preview-manifest",
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      if (id === PREVIEW_MANIFEST_MODULE_ID) {
        return RESOLVED_PREVIEW_MANIFEST_MODULE_ID
      }
    },
    load(id) {
      if (id !== RESOLVED_PREVIEW_MANIFEST_MODULE_ID) return

      const slugs = readPreviewSlugs(root)
      return `export const previewSlugs = ${JSON.stringify(slugs)};\n`
    },
    configureServer(server) {
      server.watcher.add(resolve(root, "public", "preview", "*/light.html"))
    },
    handleHotUpdate({ file, server }) {
      const normalizedFile = file.replaceAll("\\", "/")
      if (!normalizedFile.includes("/public/preview/")) return
      if (!normalizedFile.endsWith("/light.html")) return

      const module = server.moduleGraph.getModuleById(
        RESOLVED_PREVIEW_MANIFEST_MODULE_ID,
      )
      if (module) server.moduleGraph.invalidateModule(module)
      server.ws.send({ type: "full-reload" })
      return []
    },
  }
}

const config = defineConfig({
  plugins: [
    previewManifestPlugin(),
    devtools(),
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
