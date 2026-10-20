import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, posix } from "node:path"
import { readSiteFrontmatter } from "./site-frontmatter"
import type { SiteFrontmatter } from "./content-types"
import type { Plugin } from "vite"

// The site's frontmatter, read at build time (docs/adr/0011, #585).
//
// The site used to read each entry's frontmatter in the browser bundle with a
// hand parser, because a YAML library there costs ~29KB gzip and 77–111ms on
// first read. This plugin reads every `services/*.md` in Node with the one
// frontmatter reader and hands the site only the keys it consumes, as JSON —
// the same build-time pattern as `virtual:preview-slugs`.
//
// What the site accepts — and the build failure for an empty value, a value
// that is not text, a date that is not a real day — is decided once in
// `site-frontmatter.ts`, which the Node tools and the draft validator share.

export const SITE_FRONTMATTER_MODULE_ID = "virtual:site-frontmatter"

const RESOLVED_ID = `\0${SITE_FRONTMATTER_MODULE_ID}`

function servicesDir(root: string): string {
  return join(root, "services")
}

function entryFiles(root: string): Array<string> {
  const dir = servicesDir(root)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .sort()
}

const toPosix = (path: string): string => path.replace(/\\/g, "/")

/** A `services/*.md` file — what the site's glob loads. Vite hands over `/`
 *  paths even on Windows, where `join` writes `\`. */
function isEntryFile(root: string, file: string): boolean {
  const path = toPosix(file)
  return (
    path.endsWith(".md") && posix.dirname(path) === toPosix(servicesDir(root))
  )
}

export function siteFrontmatterPlugin(): Plugin {
  let root = process.cwd()

  return {
    name: "site-frontmatter",
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      return id === SITE_FRONTMATTER_MODULE_ID ? RESOLVED_ID : null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      const byPath: Record<string, SiteFrontmatter> = {}
      for (const file of entryFiles(root)) {
        const path = join(servicesDir(root), file)
        this.addWatchFile(path)
        const globPath = `/services/${file}`
        try {
          byPath[globPath] = readSiteFrontmatter(
            globPath,
            readFileSync(path, "utf8"),
            (message) => this.warn(message)
          )
        } catch (e) {
          this.error(e instanceof Error ? e.message : String(e))
        }
      }
      return `export const siteFrontmatter = ${JSON.stringify(byPath)};\n`
    },
    // `addWatchFile` alone refreshed the server's copy but left the browser's
    // stale (measured in dev, 2026-10-20), and it never sees a new entry file.
    // So every environment drops its copy when any entry is created, edited or
    // deleted, and the module joins that update.
    hotUpdate({ file, modules }) {
      if (!isEntryFile(root, file)) return
      const graph = this.environment.moduleGraph
      const mod = graph.getModuleById(RESOLVED_ID)
      if (!mod) return
      graph.invalidateModule(mod)
      return [...modules, mod]
    },
  }
}
