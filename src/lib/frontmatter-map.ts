// Where a frontmatter token map starts, where it ends, and which of its lines
// are comments — decided ONCE.
//
// Four readers need this answer and each used to work it out for itself: the
// sidecar extractor (colours and typography), the draft validator, and the
// DESIGN.md adapter. They disagreed, and the disagreement was not theoretical.
// The rule "a flush-left comment does not end the map" was got wrong twice in
// one change: a single such line cut one entry's palette from 33 colours to 11,
// and the same bug in the typography reader truncated a type scale — which is
// worse, because a truncated scale is non-zero and so looks healthy.
//
// This module deliberately does NOT parse values. Several callers must see the
// raw text: `audit:oklch` and the drift check judge whether a value is quoted,
// and a YAML parser normalises exactly that away. So each caller gets the line
// and decides for itself what the value means.

export interface MapRow {
  /** The source line, unmodified. */
  line: string
  /** Leading spaces. Two is the canonical token row; four is a nested property. */
  indent: number
  key: string
  /** Everything after `key:`, trailing comment included. Empty for a head row
   *  that only opens a nested map. */
  rest: string
  /** The `## Label` heading in force for this row, if any. Becomes the
   *  sidecar's `group`. */
  group?: string
}

/** A `  ## Label` row opens a group. Two hashes, because a single `#` is
 *  ordinary commentary — telling them apart by hash count is what lets an entry
 *  carry both (krds has six plain comments and no groups). */
const GROUP_HEADING = /^\s{2}##\s+(.*)$/
/** Any `#`-leading row, at ANY indentation. Flush-left included: YAML keeps the
 *  mapping open across it, so it must be skipped rather than treated as the end. */
const COMMENT_ROW = /^\s*#/
/** A key at column 0 — the next sibling of the map, and the only thing that
 *  actually ends it. */
const TOP_LEVEL_KEY = /^[A-Za-z_][\w-]*:/
const ROW = /^(\s+)([^\s:]+):\s*(.*)$/

/**
 * Rows of one frontmatter map, in source order.
 *
 * `frontmatter` is the block's lines (see `splitFrontmatter`). Comment-only and
 * blank lines are dropped; group headings are attached to the rows that follow
 * them rather than returned.
 */
/** The four maps whose rows become sidecar tokens. */
export const TOKEN_MAP_KEYS = [
  "colors",
  "typography",
  "spacing",
  "rounded",
] as const

/**
 * Does this line open the named map?
 *
 * A trailing comment is allowed. YAML permits one, and rejecting it was not a
 * near-miss: the document then matched no map at all, fell back to the legacy
 * body-fence path, and produced ZERO colour tokens — with the OKLCH gate going
 * quiet alongside, because it judges the rows this function yields.
 *
 * Exported so the three callers that ask this question — the row reader, the
 * extractor's frontmatter/body branch, and the migration script's
 * already-migrated guard — cannot answer it differently. They already did once,
 * over what ends a map.
 */
export function opensMap(line: string, mapKey: string): boolean {
  return new RegExp(`^${mapKey}:\\s*(?:#.*)?$`).test(line)
}

/** Does this line open any of the four token maps? */
export function opensAnyTokenMap(line: string): boolean {
  return TOKEN_MAP_KEYS.some((key) => opensMap(line, key))
}

export function mapRows(
  frontmatter: Array<string>,
  mapKey: string
): Array<MapRow> {
  const out: Array<MapRow> = []
  let inMap = false
  let group: string | undefined

  for (const line of frontmatter) {
    if (opensMap(line, mapKey)) {
      inMap = true
      group = undefined
      continue
    }
    if (inMap && TOP_LEVEL_KEY.test(line)) break
    if (!inMap) continue

    const heading = line.match(GROUP_HEADING)
    if (heading) {
      group = heading[1].trim()
      continue
    }
    if (COMMENT_ROW.test(line)) continue

    const m = line.match(ROW)
    if (!m) continue
    out.push({
      line,
      indent: m[1].length,
      key: m[2],
      rest: m[3],
      ...(group === undefined ? {} : { group }),
    })
  }
  return out
}

/**
 * Does this row OPEN a nested style rather than carry a value?
 *
 * A trailing `#` comment does not disqualify it. The catalog annotates 51 of its
 * 182 typography heads that way, and CLAUDE.md makes that comment load-bearing —
 * it becomes the token's `note`, the only channel that reaches machine consumers.
 *
 * Shared because the two readers of this map disagreed about it: the extractor
 * accepted an annotated head, the DESIGN.md adapter rejected one, and the
 * endpoint therefore published zero font stacks for baemin, gmarket and
 * kyobobook. Sharing the row splitter was not enough — the SEMANTICS above it
 * have to be shared too.
 */
export function isHeadRow(row: MapRow): boolean {
  return row.rest.trim() === "" || row.rest.startsWith("#")
}

/**
 * The authored scalar, with any trailing comment removed and nothing else
 * touched.
 *
 * Deliberately NOT decoded. The value is already a valid YAML scalar inside a
 * valid YAML document, so a consumer that re-encodes it corrupts it: unwrapping
 * `"\\"Pretendard Variable\\", …"` with a naive quote-strip leaves the inner
 * escapes as literal backslashes, and re-quoting then escapes those again. That
 * round trip mangled 82 of the 131 font stacks that reached the endpoint. Copy
 * the scalar through instead and it is correct by construction.
 */
export function authoredScalar(rest: string): string {
  const quote = rest[0]
  if (quote !== "'" && quote !== '"')
    return rest.replace(/\s+#\s?.*$/, "").trim()
  // Walk to the matching close so a `#` INSIDE the scalar is not read as a
  // comment. Only double quotes take backslash escapes in YAML.
  for (let i = 1; i < rest.length; i++) {
    if (quote === '"' && rest[i] === "\\") {
      i++
      continue
    }
    // YAML escapes a quote inside a single-quoted scalar by doubling it, so
    // `'L''Oreal'` is one value. Reading the first of the pair as the close
    // returned `'L'` and published a truncated font family.
    if (quote === "'" && rest[i] === "'" && rest[i + 1] === "'") {
      i++
      continue
    }
    if (rest[i] === quote) return rest.slice(0, i + 1)
  }
  return rest.trim()
}
