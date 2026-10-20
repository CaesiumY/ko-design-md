import {
  LineCounter,
  Parser,
  isAlias,
  isMap,
  isScalar,
  parseDocument,
} from "yaml"
import { FRONTMATTER_MAP_KEYS } from "./frontmatter-map-table"
import { splitFrontmatter } from "./frontmatter-fence"
import type { ServiceFrontmatter } from "./content-types"
import type { Document, Node, YAMLMap } from "yaml"

// The frontmatter, read ONCE, as YAML reads it (docs/adr/0011).
//
// Six places in this repo read the frontmatter, each its own way — the site's
// hand parser, the draft validator's YAML, the token extractor's line regexes,
// the drift check, `audit:oklch` and the date check — and the validator grew a
// rule for every shape on which they disagreed. This module is the one reader
// they all use now (#582). A reader that goes around it is the bug to fix, not
// a reason for a new validator rule (docs/adr/0011).
//
// It uses `yaml` with its default schema (YAML 1.2 core), the library and
// schema the official DESIGN.md linter uses, so a date stays the text written
// and a value reads the same here as in the linter.
//
// NOT for the browser bundle: the site gets these results at build time.
//
// Every `line` is a 1-based line of the whole file: the opening `---` is line
// 1, the block's first key line 2 (a leading BOM changes nothing).

/** A value as YAML's `toJS` resolves it under the core schema. */
export type FrontmatterValue =
  | string
  | number
  | boolean
  | null
  | Array<FrontmatterValue>
  | { [key: string]: FrontmatterValue }

export interface FrontmatterKey {
  /** The key as written, unquoted (see `keyName`). */
  key: string
  /** The value as YAML resolves it (`toJS`); null when nothing is written. */
  value: FrontmatterValue
  /** A scalar value's exact text in the file, quotes included. Absent for a
   *  map, a list or an empty value. */
  source?: string
  /** The first and last file lines `source` spans. A block scalar's first is
   *  its `>`/`|` header line, the key's. Present with `source`. */
  sourceLines?: [number, number]
  /** The column, from 0, where `source` starts on its first line. Present with
   *  `source`. A flow map can hold the same text twice on one line, so this,
   *  not a search of the line, says which is the value. */
  sourceColumn?: number
  line: number
  /** Nothing written after the colon (`key:`). `key: ~` and `key: []` are
   *  written values, so not empty. */
  empty: boolean
  /** The comment that ends the key's line, `#` and surrounding space removed.
   *  When the key's line has none and a scalar value ends on a later line
   *  (`primary:` + `  oklch(…)  # #3182F6`), the comment that ends that line:
   *  YAML reads it as the value's, and so does every reader here. This is what
   *  the token sidecar calls a `note`. */
  comment?: string
  /** A map value's rows, in source order. */
  rows?: Array<FrontmatterRow>
}

export interface FrontmatterEntryRow extends FrontmatterKey {
  kind: "entry"
  /** The `## Label` heading in force for this row in its map, if any. */
  group?: string
}

/** A `  ## Label` comment line, which opens a group for the rows below it. */
export interface FrontmatterGroupRow {
  kind: "group"
  label: string
  line: number
}

export type FrontmatterRow = FrontmatterEntryRow | FrontmatterGroupRow

export interface FrontmatterRead {
  ok: true
  keys: Array<FrontmatterKey>
}

export interface FrontmatterError {
  message: string
  line: number
}

export interface FrontmatterReadFailure {
  ok: false
  /** `missing`: no block at all — no opening or no closing `---`. `yaml`: the
   *  block is there but does not read as a map of keys, each named once. */
  reason: "missing" | "yaml"
  errors: Array<FrontmatterError>
}

export type FrontmatterResult = FrontmatterRead | FrontmatterReadFailure

interface CommentToken {
  offset: number
  source: string
}

/** Every comment in the text, from YAML's own tokens — so a `#` inside a
 *  quoted value or a block scalar is never mistaken for one. */
function commentTokens(text: string): Array<CommentToken> {
  const out: Array<CommentToken> = []
  // eslint-disable-next-line no-restricted-syntax -- The CST is walked generically: comment tokens sit in several differently-typed slots.
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item)
      return
    }
    if (typeof node !== "object" || node === null) return
    const token = node as {
      type?: string
      offset?: number
      source?: string
    }
    if (
      token.type === "comment" &&
      typeof token.offset === "number" &&
      typeof token.source === "string"
    ) {
      out.push({ offset: token.offset, source: token.source })
      return
    }
    for (const value of Object.values(node)) walk(value)
  }
  for (const token of new Parser().parse(text)) walk(token)
  return out
}

function isEmpty(node: Node | null): boolean {
  if (node === null) return true
  if (!isScalar(node) || node.value !== null) return false
  const range = node.range
  return range ? range[0] === range[1] : true
}

/** A `## Label` comment opens a group. Two hashes, because a single `#` is
 *  ordinary commentary. */
const GROUP_HEADING = /^##\s+(.*)$/

/** One parsed block, with the line facts every reader needs. */
class Reading {
  /** Comments that END a line (something precedes them on it), by file line,
   *  with where they start in the block. */
  private readonly lineEndComments = new Map<
    number,
    { offset: number; text: string }
  >()
  /** Indented `## Label` comments alone on their line, by file line. */
  private readonly groupHeadings = new Map<number, string>()

  constructor(
    private readonly text: string,
    private readonly doc: Document,
    private readonly lineCounter: LineCounter
  ) {
    for (const { offset, source } of commentTokens(text)) {
      const { line, col } = lineCounter.linePos(offset)
      const before = text.slice(lineCounter.lineStarts[line - 1], offset)
      if (before.trim() !== "") {
        this.lineEndComments.set(line + 1, {
          offset,
          text: source.replace(/^#/, "").trim(),
        })
        continue
      }
      const heading = source.match(GROUP_HEADING)
      if (heading && col > 1)
        this.groupHeadings.set(line + 1, heading[1].trim())
    }
  }

  /** File line of an offset into the block: the block starts on line 2. */
  fileLine(offset: number): number {
    return this.lineCounter.linePos(offset).line + 1
  }

  /** Column of an offset on its line, counted from 0. */
  column(offset: number): number {
    return this.lineCounter.linePos(offset).col - 1
  }

  /** Last file line a node's content reaches, trailing comments excluded. */
  private endLine(node: Node | null, keyLine: number): number {
    if (node === null) return keyLine
    if (isMap(node)) {
      const last = node.items.at(-1)
      if (!last) return keyLine
      return this.endLine(
        last.value as Node | null,
        this.keyLine(last.key as Node)
      )
    }
    const range = node.range
    if (!range || range[1] <= range[0]) return keyLine
    return this.fileLine(range[1] - 1)
  }

  private keyLine(keyNode: Node): number {
    return this.fileLine(keyNode.range?.[0] ?? 0)
  }

  /** A key as written, unquoted. A plain key keeps its source spelling, so
   *  `1.0:` stays `1.0` (YAML's value is the number 1); a quoted key is its
   *  string. */
  private keyName(keyNode: Node): string {
    // An alias key (`? *k`) is the key it points at, to YAML and to every
    // consumer of the file.
    if (isAlias(keyNode)) {
      const target = keyNode.resolve(this.doc)
      return isScalar(target) ? String(target.value) : String(keyNode)
    }
    if (!isScalar(keyNode)) return String(keyNode)
    if (keyNode.type === "PLAIN" && keyNode.range) {
      return this.text.slice(keyNode.range[0], keyNode.range[1])
    }
    return String(keyNode.value)
  }

  /**
   * The comment ending `line`, if it is this key's. One line can hold several
   * keys (`colors: { a: …, b: … } # note`), and the comment is the node's that
   * ends right before it: the key's when only blanks — and the `,` that
   * separates it from the next pair in a flow map (`  a: oklch(…),  # #hex`) —
   * stand between its value's end and the `#`, or when its value runs past the
   * comment: a block scalar's header comment, `key: # note` above a value, a
   * map whose rows follow. Not a pair's that a later pair or the map's closing
   * `}` follows on the line: that comment is the map's, as YAML reads it.
   */
  private ownComment(
    line: number,
    keyNode: Node,
    valueNode: Node | null
  ): string | undefined {
    const comment = this.lineEndComments.get(line)
    if (!comment) return undefined
    const end = valueNode?.range?.[1]
    if (end === undefined || end > comment.offset) {
      return (keyNode.range?.[1] ?? 0) <= comment.offset
        ? comment.text
        : undefined
    }
    return /^\s*,?\s*$/.test(this.text.slice(end, comment.offset))
      ? comment.text
      : undefined
  }

  entry(keyNode: Node, valueNode: Node | null): FrontmatterKey {
    const line = this.keyLine(keyNode)
    const empty = isEmpty(valueNode)
    const range = !empty && isScalar(valueNode) ? valueNode.range : undefined
    const source = range ? this.text.slice(range[0], range[1]) : undefined
    const sourceLines: [number, number] | undefined = range
      ? [this.fileLine(range[0]), this.endLine(valueNode, line)]
      : undefined
    const sourceColumn = range ? this.column(range[0]) : undefined
    // Only a scalar's last line: a map's is its last row's, whose comment is
    // that row's own.
    const comment =
      this.ownComment(line, keyNode, valueNode) ??
      (sourceLines
        ? this.ownComment(sourceLines[1], keyNode, valueNode)
        : undefined)
    return {
      key: this.keyName(keyNode),
      value: valueNode?.toJS(this.doc) ?? null,
      ...(source === undefined ? {} : { source, sourceLines, sourceColumn }),
      line,
      empty,
      ...(comment === undefined ? {} : { comment }),
      ...(isMap(valueNode) ? { rows: this.rows(valueNode, line) } : {}),
    }
  }

  /** A nested map's rows in source order, each group heading placed before
   *  the row it opens. A heading belongs to this map when it sits in the gap
   *  before one of its rows — not inside a row's own nested value. */
  private rows(map: YAMLMap, openLine: number): Array<FrontmatterRow> {
    const out: Array<FrontmatterRow> = []
    let gapStart = openLine
    let group: string | undefined
    for (const pair of map.items) {
      const keyNode = pair.key as Node
      const valueNode = pair.value as Node | null
      const line = this.keyLine(keyNode)
      for (let l = gapStart + 1; l < line; l++) {
        const label = this.groupHeadings.get(l)
        if (label === undefined) continue
        group = label
        out.push({ kind: "group", label, line: l })
      }
      out.push({
        kind: "entry",
        ...this.entry(keyNode, valueNode),
        ...(group === undefined ? {} : { group }),
      })
      gapStart = this.endLine(valueNode, line)
    }
    return out
  }
}

function failure(
  message: string,
  line: number,
  reason: FrontmatterReadFailure["reason"] = "yaml"
): FrontmatterReadFailure {
  return { ok: false, reason, errors: [{ message, line }] }
}

/**
 * Every key that repeats a name an earlier key of the same map already has —
 * the top level, or the rows of any map below it. YAML refuses two equal
 * scalar keys itself, but not two keys that only read as the same name here:
 * an alias key (`? *k`) that resolves to a key written beside it, or `500:`
 * beside `"500":` (a number and a string to YAML, both `500` to `keyName`).
 * Readers then disagree on the value: `findKey` and the token readers take the
 * first, the site build, the validator's field checks and the linter (`toJS`)
 * the last. Refusing the block keeps one value per name for all of them.
 */
function duplicateKeys(
  entries: ReadonlyArray<FrontmatterKey>
): Array<FrontmatterError> {
  const out: Array<FrontmatterError> = []
  const seen = new Map<string, number>()
  for (const entry of entries) {
    const first = seen.get(entry.key)
    if (first === undefined) seen.set(entry.key, entry.line)
    else {
      out.push({
        message: `the key \`${entry.key}\` is written twice in one map (line ${first} and line ${entry.line}) — an alias key (\`? *k\`) or a number and its quoted spelling (\`500:\` and \`"500":\`) name the same key here. YAML keeps the last value and the token readers the first, so they would publish different values. Write the key once.`,
        line: entry.line,
      })
    }
    out.push(...duplicateKeys(entriesOf(entry)))
  }
  return out
}

export function readFrontmatter(raw: string): FrontmatterResult {
  const split = splitFrontmatter(raw)
  if (!split) {
    return failure(
      "no frontmatter block: the file must open with a `---` line and close the block with another",
      1,
      "missing"
    )
  }
  const lineCounter = new LineCounter()
  const doc = parseDocument(split.frontmatter, { lineCounter })
  const reading = new Reading(split.frontmatter, doc, lineCounter)
  if (doc.errors.length > 0) {
    return {
      ok: false,
      reason: "yaml",
      errors: doc.errors.map((e) => ({
        message: e.message.split("\n")[0],
        line: reading.fileLine(e.pos[0]),
      })),
    }
  }
  const contents = doc.contents
  if (contents === null) return { ok: true, keys: [] }
  if (!isMap(contents)) {
    return failure(
      "frontmatter is not a map of `key: value` lines",
      reading.fileLine(contents.range[0])
    )
  }
  const keys: Array<FrontmatterKey> = []
  for (const pair of contents.items) {
    const keyNode = pair.key as Node
    try {
      keys.push(reading.entry(keyNode, pair.value))
    } catch (e) {
      // `toJS` refuses past its alias limit (100) rather than expand a
      // billion-laughs value. Converting key by key pins the refusal to the
      // key that caused it.
      const why = e instanceof Error ? e.message : String(e)
      return failure(
        `YAML cannot expand this value within its alias limit (${why}). Write the value itself, with no anchors or aliases.`,
        reading.fileLine(keyNode.range?.[0] ?? 0)
      )
    }
  }
  const duplicates = duplicateKeys(keys)
  if (duplicates.length > 0) {
    return {
      ok: false,
      reason: "yaml",
      errors: duplicates.sort((a, b) => a.line - b.line),
    }
  }
  return { ok: true, keys }
}

/** The top-level key named `name`, if the block writes it. */
export function findKey(
  keys: ReadonlyArray<FrontmatterKey>,
  name: string
): FrontmatterKey | undefined {
  return keys.find((k) => k.key === name)
}

/** A map value's entry rows in source order, its `## Label` group rows left
 *  out. Empty for a value that is not a map. */
export function entriesOf(
  key: FrontmatterKey | undefined
): Array<FrontmatterEntryRow> {
  return (key?.rows ?? []).filter(
    (row): row is FrontmatterEntryRow => row.kind === "entry"
  )
}

/**
 * A token value as text: what YAML reads for a string (quotes and escapes
 * undone, a block scalar folded), trimmed — so `"  oklch(…)"` and a block
 * scalar that opens on a blank line read as the `oklch(…)` they publish — and
 * the spelling as written for a number or boolean — YAML reads
 * `lineHeight: 1.50` as 1.5, and the sidecar carries `1.50`. Undefined for no
 * value, a map or a list.
 *
 * Shared by the token extractor, the draft validator's token rules and the
 * colour readers (`oklchEntries`: the drift check and `audit:oklch`), so the
 * value a rule judges or audits is the value the sidecar publishes.
 */
export function tokenText(entry: FrontmatterKey): string | undefined {
  const { value, source } = entry
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" || typeof value === "boolean") return source
  return undefined
}

// The keys the site reads into `ServiceFrontmatter`. Typed against the
// interface so a typo here is a compile error. The build reads exactly these
// (`site-frontmatter.ts`), and the draft validator judges them.
export const CONSUMED_KEYS: ReadonlyArray<keyof ServiceFrontmatter> = [
  "name",
  "design_system_name",
  "slug",
  "category",
  "last_updated",
  "created_at",
  "lang",
  "estimated_tokens",
  "logo",
]

// Keys that are valid in the file but that the site never reads. Tokens live
// here in the Google DESIGN.md shape; the site takes them from the
// `{slug}.tokens.json` sidecar instead. They are listed so the unknown-key rule
// stops reporting ~100 false warnings. The maps come from the table in
// `frontmatter-map-table`, which every other reader of them derives its list
// from too.
const FILE_ONLY_KEYS: ReadonlyArray<string> = [
  ...FRONTMATTER_MAP_KEYS,
  "preview_css_vars",
  // Both spellings the skill docs name. `font-sans-src` has no catalog entry yet,
  // but leaving it out would warn on the first one that needs it — the allowlist
  // and the authoring docs have to agree or the warning is just noise.
  "font-display-src",
  "font-sans-src",
]

export const KNOWN_FRONTMATTER_KEYS: ReadonlyArray<string> = [
  ...CONSUMED_KEYS,
  ...FILE_ONLY_KEYS,
]
