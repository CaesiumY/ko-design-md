import { buildSiteDoc } from "./content-parser"
import {
  CONSUMED_KEYS,
  KNOWN_FRONTMATTER_KEYS,
  readFrontmatter,
} from "./frontmatter"
import type { FrontmatterKey, FrontmatterRead } from "./frontmatter"
import type { ServiceDoc, SiteFrontmatter } from "./content-types"

// The site's frontmatter as the build takes it from the one reader
// (docs/adr/0011, #585) — NOT for the browser bundle.
//
// The build plugin (`site-frontmatter-plugin.ts`) hands these values to the
// site; `buildDoc` assembles the same document for the Node tools (the OG
// build, the sidecar build, the E2E expectations); the draft validator asks
// `siteValue` about the values its field rules do not judge. One function
// decides what the site accepts, so a value the validator passes is a value
// the build takes.
//
// A consumed key written with no value (`name:`, or YAML's `name: ~`) fails
// here instead of falling back to a default on the site, which turned an empty
// name into the slug without anyone noticing. A key left out entirely keeps the
// site's existing derivation (slug from the file name, token estimate from the
// text, and so on). The exception is `FALLBACK_KEYS`, whose value has always
// come from another source when missing: written empty, they are left out like
// an absent key.

/** Keys that derive from another source when missing — the slug from the file
 *  name, the token count from the text. Spec #582 keeps that rule for an empty
 *  value too, and the draft validator accepts both written empty (#488), so a
 *  build failure here would break the site for a file that passed the gate. */
const FALLBACK_KEYS: ReadonlyArray<string> = ["slug", "estimated_tokens"]

/** Keys whose value is one line of text. `estimated_tokens` is the only
 *  number. */
const TEXT_KEYS: ReadonlyArray<string> = CONSUMED_KEYS.filter(
  (key) => key !== "estimated_tokens"
)

// The digit pattern alone accepts impossible dates (`2026-02-30`, `2026-99-99`),
// and downstream those are worse than a parse error: the catalog compares
// created_at as a plain string, so an out-of-range month sorts above every real
// date and pins the entry to the top of the list. Round-tripping through Date
// rejects them — JS rolls overflow into the next month/year, so any field that
// changes was out of range — and gets leap years right for free.
//
// Corner case worth naming: a 0–99 year such as "0099-01-01" is also rejected,
// but by JS's legacy two-digit-year rule rather than by calendar arithmetic
// (`Date.UTC(99, …)` means 1999, so the round-trip mismatches). Rejecting is the
// outcome we want either way — no catalog entry predates the web.
function isRealIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [year, month, day] = match.slice(1).map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}

/**
 * One consumed key's value as the site takes it: text for the text keys, a
 * number for `estimated_tokens`, undefined for a fallback key written empty.
 * Throws, naming `where`, for a value the site refuses — no value, a value YAML
 * reads as something other than text (`name: 1.50`, `lang: [ko]`), a date that
 * is not a real `YYYY-MM-DD` day, or a count YAML does not read as a number
 * (`"1200"` is text to YAML, and to every other reader of the file).
 */
export function siteValue(
  entry: FrontmatterKey,
  where: string
): string | number | undefined {
  const { key, value } = entry
  if (value === null && FALLBACK_KEYS.includes(key)) return undefined
  if (value === null) {
    throw new Error(
      `${where}: \`${key}\` has no value. Write its value, or delete the line if the key is optional.`
    )
  }
  if (!TEXT_KEYS.includes(key)) {
    if (typeof value === "number" && Number.isFinite(value)) return value
    throw new Error(
      `${where}: \`${key}\` must be a plain decimal number YAML reads as one (\`${key}: 1200\`, unquoted), got ${JSON.stringify(value)}`
    )
  }
  if (typeof value !== "string") {
    throw new Error(
      `${where}: \`${key}\` must be one line of text — quote it if YAML reads it as something else, got ${JSON.stringify(value)}`
    )
  }
  if (
    (key === "last_updated" || key === "created_at") &&
    !isRealIsoDate(value)
  ) {
    throw new Error(
      `${where}: \`${key}\` must be a real calendar date in ISO YYYY-MM-DD form, got "${value}"`
    )
  }
  return value
}

/** One entry's consumed keys as the site takes them. Throws for a block YAML
 *  cannot read and for any value `siteValue` refuses; warns on a key the
 *  catalog does not know. `path` names the file in every message. */
export function siteFrontmatterOf(
  path: string,
  raw: string,
  warn: (message: string) => void
): SiteFrontmatter {
  const result = readFrontmatter(raw)
  if (!result.ok) {
    const [first] = result.errors
    throw new Error(
      `[site-frontmatter] ${path}:${first.line}: frontmatter does not read as YAML — ${first.message}`
    )
  }
  return siteFrontmatterFrom(path, result, warn)
}

/** `siteFrontmatterOf` for a block already read — the draft validator reads
 *  once and asks this what the site would take. */
export function siteFrontmatterFrom(
  path: string,
  read: FrontmatterRead,
  warn: (message: string) => void
): SiteFrontmatter {
  const out: Record<string, string | number> = {}
  for (const entry of read.keys) {
    if (!KNOWN_FRONTMATTER_KEYS.includes(entry.key)) {
      warn(
        `[site-frontmatter] Unknown frontmatter key "${entry.key}" in ${path} (ignored)`
      )
      continue
    }
    if (!(CONSUMED_KEYS as ReadonlyArray<string>).includes(entry.key)) continue
    const value = siteValue(entry, `[site-frontmatter] ${path}:${entry.line}`)
    if (value !== undefined) out[entry.key] = value
  }
  return out
}

/**
 * An entry's document as the site builds it, for the Node tools. The same
 * reading and the same checks as the build, so a tool never sees a value the
 * site would refuse.
 */
export function buildDoc(filePath: string, raw: string): ServiceDoc {
  return buildSiteDoc(
    filePath,
    raw,
    siteFrontmatterOf(filePath, raw, (message) => console.warn(message))
  )
}
