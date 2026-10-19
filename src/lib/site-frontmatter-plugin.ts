import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, posix } from "node:path"
import {
  CONSUMED_KEYS,
  KNOWN_FRONTMATTER_KEYS,
  coerceNumberField,
  normalizeDateField,
} from "./content-parser"
import { readFrontmatter } from "./frontmatter"
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
// The field checks the site used to run in the browser (real ISO dates, a
// numeric token count) run here too, so a bad value fails the build and the
// browser receives values it can use as they are.
//
// A consumed key written with no value (`name:`, or YAML's `name: ~`) fails the
// build here instead of falling back to a default on the site, which turned an
// empty name into the slug without anyone noticing. A key left out entirely
// keeps the site's existing derivation (slug from the file name, token
// estimate from the text, and so on).
//
// The exception is `FALLBACK_KEYS`, whose value has always come from another
// source when missing: written empty, they are left out like an absent key.

export const SITE_FRONTMATTER_MODULE_ID = "virtual:site-frontmatter"

/** Keys that derive from another source when missing — the slug from the file
 *  name, the token count from the text. Spec #582 keeps that rule for an empty
 *  value too, and the draft validator accepts both written empty (#488), so a
 *  build failure here would break the site for a file that passed the gate. */
const FALLBACK_KEYS: ReadonlyArray<string> = ["slug", "estimated_tokens"]
const RESOLVED_ID = `\0${SITE_FRONTMATTER_MODULE_ID}`

/** Keys whose value is one line of text. `estimated_tokens` is the only
 *  number; the site coerces it as before. */
const TEXT_KEYS = CONSUMED_KEYS.filter((key) => key !== "estimated_tokens")

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

/** One entry's consumed keys, or a message naming what is wrong with it. */
function readEntry(
  globPath: string,
  raw: string,
  warn: (message: string) => void
): SiteFrontmatter {
  const result = readFrontmatter(raw)
  if (!result.ok) {
    const [first] = result.errors
    throw new Error(
      `[site-frontmatter] ${globPath}:${first.line}: frontmatter does not read as YAML — ${first.message}`
    )
  }
  const out: Record<string, string | number> = {}
  for (const { key, value, line } of result.keys) {
    if (!KNOWN_FRONTMATTER_KEYS.includes(key)) {
      warn(
        `[site-frontmatter] Unknown frontmatter key "${key}" in ${globPath} (ignored)`
      )
      continue
    }
    if (!(CONSUMED_KEYS as ReadonlyArray<string>).includes(key)) continue
    const where = `${globPath}:${line}`
    if (value === null && FALLBACK_KEYS.includes(key)) continue
    if (value === null) {
      throw new Error(
        `[site-frontmatter] ${where}: \`${key}\` has no value. Write its value, or delete the line if the key is optional.`
      )
    }
    const isText = (TEXT_KEYS as ReadonlyArray<string>).includes(key)
    if (typeof value !== "string" && (isText || typeof value !== "number")) {
      throw new Error(
        `[site-frontmatter] ${where}: \`${key}\` must be ${isText ? "one line of text — quote it if YAML reads it as something else" : "a number"}, got ${JSON.stringify(value)}`
      )
    }
    out[key] =
      key === "estimated_tokens"
        ? (coerceNumberField(value, key, where) as number)
        : key === "last_updated" || key === "created_at"
          ? normalizeDateField(value, where, key)
          : value
  }
  return out
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
          byPath[globPath] = readEntry(
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
