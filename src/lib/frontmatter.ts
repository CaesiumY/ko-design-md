import { LineCounter, Parser, isMap, isScalar, parseDocument } from "yaml"
import { splitFrontmatter } from "./content-parser"
import type { Document, Node, YAMLMap } from "yaml"

// The frontmatter, read ONCE, as YAML reads it (docs/adr/0011).
//
// Six places in this repo read the frontmatter, each its own way — the site's
// hand parser, the draft validator's YAML, the token extractor's line regexes,
// the drift check, `audit:oklch` and the date check — and the validator grew a
// rule for every shape on which they disagreed. This module is the one reader
// they move onto, ticket by ticket (#582). Nothing imports it yet.
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
  line: number
  /** Nothing written after the colon (`key:`). `key: ~` and `key: []` are
   *  written values, so not empty. */
  empty: boolean
  /** The comment that ends the key's line, `#` and surrounding space removed.
   *  This is what the token sidecar calls a `note`. */
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
  /** Comments that END a line (something precedes them on it), by file line. */
  private readonly lineEndComments = new Map<number, string>()
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
        this.lineEndComments.set(line + 1, source.replace(/^#/, "").trim())
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
    if (!isScalar(keyNode)) return String(keyNode)
    if (keyNode.type === "PLAIN" && keyNode.range) {
      return this.text.slice(keyNode.range[0], keyNode.range[1])
    }
    return String(keyNode.value)
  }

  entry(keyNode: Node, valueNode: Node | null): FrontmatterKey {
    const line = this.keyLine(keyNode)
    const comment = this.lineEndComments.get(line)
    const empty = isEmpty(valueNode)
    const source =
      !empty && isScalar(valueNode) && valueNode.range
        ? this.text.slice(valueNode.range[0], valueNode.range[1])
        : undefined
    return {
      key: this.keyName(keyNode),
      value: valueNode?.toJS(this.doc) ?? null,
      ...(source === undefined ? {} : { source }),
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

function failure(message: string, line: number): FrontmatterReadFailure {
  return { ok: false, errors: [{ message, line }] }
}

export function readFrontmatter(raw: string): FrontmatterResult {
  const split = splitFrontmatter(raw)
  if (!split) {
    return failure(
      "no frontmatter block: the file must open with a `---` line and close the block with another",
      1
    )
  }
  const lineCounter = new LineCounter()
  const doc = parseDocument(split.frontmatter, { lineCounter })
  const reading = new Reading(split.frontmatter, doc, lineCounter)
  if (doc.errors.length > 0) {
    return {
      ok: false,
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
  return { ok: true, keys }
}
