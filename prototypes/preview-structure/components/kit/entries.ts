// PROTOTYPE — throwaway code. Where item modules live and how one is built.
//
// An item is a folder: preview.ts (the module, default-exporting a
// definePreview(...)), light.css and dark.css (the brand's two style sheets).

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { renderPreview } from "./parts.ts"
import type { PreviewDef } from "./parts.ts"

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, "../../../..")
export const ENTRIES_DIR = resolve(HERE, "../entries")

/** Slugs that have an item module, sorted. */
export const ENTRIES: Array<string> = readdirSync(ENTRIES_DIR, {
  withFileTypes: true,
})
  .filter(
    (d) =>
      d.isDirectory() && existsSync(join(ENTRIES_DIR, d.name, "preview.ts"))
  )
  .map((d) => d.name)
  .sort()

export const entryDir = (slug: string): string => join(ENTRIES_DIR, slug)

export const servedPath = (slug: string): string =>
  join(ROOT, "public", "preview", slug, "preview.html")

const read = (file: string): string =>
  existsSync(file) ? readFileSync(file, "utf8").replace(/\r\n/g, "\n") : ""

/** Builds the item in `dir` (an entries/ folder or a staging copy of one). */
export async function buildDir(
  dir: string
): Promise<{ def: PreviewDef; html: string }> {
  const mod = (await import(pathToFileURL(join(dir, "preview.ts")).href)) as {
    default: PreviewDef
  }
  const def = mod.default
  const html = renderPreview(def, {
    light: read(join(dir, "light.css")),
    dark: read(join(dir, "dark.css")),
  })
  return { def, html }
}

export async function buildEntry(slug: string): Promise<string> {
  return (await buildDir(entryDir(slug))).html
}
