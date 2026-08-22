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
export function mapRows(
  frontmatter: Array<string>,
  mapKey: string
): Array<MapRow> {
  const opens = new RegExp(`^${mapKey}:\\s*$`)
  const out: Array<MapRow> = []
  let inMap = false
  let group: string | undefined

  for (const line of frontmatter) {
    if (opens.test(line)) {
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
