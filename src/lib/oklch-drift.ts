import { splitFrontmatter } from "./content-parser"
// Detect preview CSS that no longer agrees with the design.md it was built from.
//
// This exists because the gates added alongside it could not see their own
// blast radius: `audit:oklch` judges `token: oklch(…)  # #hex` lines in
// services/*.md, `validate:catalog` the same, and `validate:previews` only
// structure and responsiveness. So when a bad `--sync` wrote the wrong colour
// into `public/preview/11st/light.html`, every gate stayed green.

export interface DriftFinding {
  name: string
  preview: string
  expected: string
}

/** `oklch( 0.670  0 0 )` and `oklch(0.67 0 0)` are the same colour. */
const normalise = (value: string): string =>
  value
    .replace(/[\d.]+/g, (n) => String(Number(n)))
    .replace(/\s+/g, " ")
    .replace(/\(\s/g, "(")
    .replace(/\s\)/g, ")")
    .trim()

/**
 * Blank out CSS block comments so the scanner cannot read prose as CSS.
 *
 * This is not tidiness. The scanner decides scope from the raw text, so a
 * comment that merely *names* the dark selector switches the check off:
 * `public/preview/codeit/light.html` — the pre-merge light half, now inside
 * `preview.html` — documented its own theme layering with "THEME-VARIANT
 * (re-declared under [data-theme="dark"])" in a banner comment,
 * which armed `pendingDark`, made the next `:root {` look like a dark block,
 * and dropped every one of that file's 91 declarations — 56 of which belong in
 * the light scope (the other 35 are inside a genuine dark block and are meant
 * to be skipped). A comment describing the rule must not disable it.
 *
 * Replaced with spaces rather than removed, because in CSS a comment SEPARATES
 * tokens. Put an empty comment in the middle of a property name — between the
 * `0` and the `6` of `--gray-06` — and deleting it splices the halves into a
 * declaration the stylesheet does not contain, which the scanner would then
 * compare. A space keeps the halves apart, which is what a CSS parser sees.
 *
 * (Brace depth is NOT the reason, though it looks like it. The scan counts
 * braces in the stripped text, so a comment's braces are gone either way.)
 *
 * An unterminated comment runs to the end. That is what a CSS parser does, and
 * it fails closed — the alternative reads a half-written comment as markup and
 * invents declarations out of a truncated file.
 */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?(?:\*\/|$)/g, (m) => m.replace(/[^\n]/g, " "))
}

/**
 * `name: oklch(…)` definitions in a design.md, normalised for comparison.
 *
 * A name stated twice with DIFFERENT values is dropped, not resolved. A design.md
 * may restate the same semantic alias per theme — `services/wanted.md` declares
 * `bg-canvas` under both `### Semantic alias — Light` and `— Dark` — and this
 * function has no theme context to choose with. It used to keep whichever came
 * last, so the map held the dark value while the gate compares a LIGHT preview,
 * and every such token reported a disagreement that did not exist (measured: 10
 * on `wanted`, all spurious). Not comparing is the honest answer; guessing is
 * how the gate ends up accusing a correct preview.
 *
 * Note the asymmetry this closes. `findPreviewDrift` tracks brace depth to skip
 * `[data-theme="dark"]` blocks on the preview side; nothing did the equivalent
 * on the md side. The prefix map is what made it observable — at 22 matched
 * declarations none of these names were reached.
 *
 * Scoping by markdown heading was measured and rejected: keying on a heading
 * whose text mentions dark also swallows `services/codeit.md`'s
 * `### 프리미티브 스케일 — 다크 테마`, dropping 78 uniquely-named `dark-gray-*`
 * definitions that conflict with nothing. It also needs fence-aware heading
 * detection, because a `# Neutral dark` comment inside a yaml fence
 * (`services/yeogi.md:156`) is not a heading. Dropping conflicts costs 22
 * comparisons on one slug and needs neither.
 *
 * Those 22 are recoverable — a fence-aware heading scoper would keep both theme
 * blocks apart, and giving theme redeclarations distinct names would remove the
 * conflict outright. Neither is worth doing for one slug on its own, and the
 * names are no longer dropped in silence: `duplicate-token-value` in
 * `draft-validator.ts` warns on every one, quoting the comparison it costs.
 */
export function readDefinitions(markdown: string): Map<string, string> {
  const defs = allDefinitions(markdown)
  const out = new Map<string, string>()
  for (const [name, value] of defs) {
    if (!out.has(name)) out.set(name, value)
  }
  for (const name of conflictsIn(defs).keys()) out.delete(name)
  return out
}

/**
 * The frontmatter block, or the whole document when there is none.
 *
 * Token definitions live in frontmatter now, indented two spaces under a
 * `colors:` map. Relaxing the anchor to `^\s*` without also narrowing the search
 * would reach into body fences that were never token definitions — `wanted`'s
 * `## Components` block has nested `bg:` / `fg:` rows that would then register
 * as colours and manufacture duplicate-name conflicts the catalog does not have
 * (measured: 0 conflicts today). Scope first, then relax.
 */
export function frontmatterBlock(markdown: string): string {
  // Falls back to the WHOLE input on purpose: callers hand this either a full
  // document or a bare body, and a body has no frontmatter to slice.
  return splitFrontmatter(markdown)?.frontmatter ?? markdown
}

/** Every `name: oklch(…)` definition in the frontmatter token maps, in document
 *  order, duplicates included. */
function allDefinitions(markdown: string): Array<[string, string]> {
  return [
    ...frontmatterBlock(markdown).matchAll(
      /^[ \t]*([a-z][\w-]*):[ \t]+(oklch\([^)]*\))/gm
    ),
  ].map((m) => [m[1], normalise(m[2])])
}

/**
 * The names `readDefinitions` refuses to return, mapped to the DISTINCT values
 * they disagree on — not to their declarations. A name written three times as
 * `A`, `B`, `A` yields two entries, because two is how many answers the file
 * offers; callers must not describe that number as a declaration count.
 *
 * Exported so `validate:catalog` can warn about the same thing this file drops.
 * Anything that dropped silently was, until now, invisible to every gate in the
 * repo — `token-extractor` just picks one, and the drift gate used to compare
 * whichever came last, which meant a real typo was caught only by the accident
 * of the preview disagreeing with it. Closing that accident (#243) is what made
 * a warn necessary — the history is in #245.
 *
 * A caller could scan the markdown itself, but then "what the validator warns
 * about" and "what the gate silently skips" would be two regexes that have to
 * be kept in step by hand. They are the same question, so they are one function.
 *
 * Restating a name with the SAME value is not a conflict — `wanted` writes
 * `fg-on-brand: oklch(1 0 0)` in both of its theme blocks and that value stays
 * checkable. Values are compared after `normalise`, so `oklch(0.670 0 0)` and
 * `oklch(0.67 0 0)` agree.
 */
export function conflictingDefinitions(
  markdown: string
): Map<string, Array<string>> {
  return conflictsIn(allDefinitions(markdown))
}

/** Shared so one document scan serves both the drop and the report. */
function conflictsIn(
  defs: ReadonlyArray<[string, string]>
): Map<string, Array<string>> {
  const seen = new Map<string, Array<string>>()
  for (const [name, value] of defs) {
    const values = seen.get(name)
    if (values === undefined) seen.set(name, [value])
    else if (!values.includes(value)) values.push(value)
  }
  return new Map([...seen].filter(([, values]) => values.length > 1))
}

/**
 * How each slug's preview renames its md tokens, as leading-substring rewrites
 * applied to the MD name to produce the preview's name.
 *
 * Previews namespace their custom properties (`--tds-blue-500`) while md keys
 * are bare (`blue-500`), so exact-name matching reached 22 of 706 declarations
 * and 14 of 17 slugs were unchecked entirely (issue #240). Suffix matching is
 * not the answer — it pairs `--c101-on-primary` with `primary`, which is why
 * `findPreviewDrift` refuses it. A declared, per-slug rewrite is.
 *
 * Rules are tried in order and the first whose `from` matches wins; an empty
 * `from` matches anything, so it belongs last as the catch-all. Two rules are
 * needed where a slug renames one family differently from the rest — md
 * `ldsg-color-linegreen` is `--ldsg-linegreen`, and `gray0` is `--g-gray-0`,
 * neither of which a single prefix reaches.
 *
 * This lives here rather than in md frontmatter deliberately. `KNOWN_FRONTMATTER_KEYS`
 * is a published surface — it ships verbatim in llms.txt and the site reads it —
 * and how this repo's preview CSS names its variables is not a property of the
 * design system being documented. A new catalogue entry missing from this table
 * is caught by `oklch-drift-corpus.test.ts`, not by a silent zero.
 */
// `Partial` so indexing a slug that has no entry types as `undefined` — most
// of the catalogue needs no rewrite and the lookup below must say so.
const PREVIEW_TOKEN_ALIASES: Partial<
  Record<string, ReadonlyArray<readonly [string, string]>>
> = {
  baemin: [["", "bm-"]],
  class101: [["", "c101-"]],
  codeit: [
    ["codeit-", "ci-"],
    ["", "ci-"],
  ],
  gmarket: [["", "gds-"]],
  greeting: [
    ["gray", "g-gray-"],
    ["", "g-"],
  ],
  krds: [["", "krds-"]],
  kyobobook: [["", "kds-"]],
  "line-design-system": [
    ["ldsg-color-", "ldsg-"],
    ["", "ldsg-"],
  ],
  "seed-design": [["", "seed-"]],
  socar: [["", "sf-"]],
  teamsparta: [
    ["brand-", "sp-"],
    ["", "sp-"],
  ],
  toss: [["", "tds-"]],
  "vapor-ui": [["", "vp-"]],
  wanted: [["", "w-"]],
  yeogi: [
    ["yeogi-", "yg-"],
    ["", "yg-"],
  ],
}

/**
 * Add each definition under the name that `slug`'s preview uses for it.
 *
 * Aliases are ADDED, never substituted, and never overwrite a name the md
 * already defines. `class101` declares both `--primary` and `--c101-primary`
 * in its preview and both would fold onto md `primary`; keeping the exact name
 * authoritative means the alias can only ever fill a gap. The two agree today,
 * so nothing changes — this is what stops one of the two reports becoming
 * meaningless on the day they diverge.
 *
 * A slug with no entry gets no aliases, which is correct for `11st` (preview
 * and md already agree) and unavoidable for `bezier` (its preview declares no
 * `oklch` at all — hex — so no naming rule can reach it).
 *
 * Always returns a NEW map, including in that case. Handing back the caller's
 * own map for some slugs and a copy for others is the kind of contract that
 * holds right up until someone mutates the result and quietly corrupts the
 * `readDefinitions` output for one half of the catalogue.
 */
export function alignToPreviewNames(
  definitions: Map<string, string>,
  slug: string
): Map<string, string> {
  const out = new Map(definitions)
  const rules = PREVIEW_TOKEN_ALIASES[slug]
  if (rules === undefined) return out
  const claimedBy = new Map<string, string>()
  const ambiguous = new Set<string>()
  for (const [name, value] of definitions) {
    for (const [from, to] of rules) {
      if (from !== "" && !name.startsWith(from)) continue
      // A catch-all prepend must not double a namespace the md name already
      // carries — `c101-primary` would otherwise gain `c101-c101-primary`, a
      // name no preview declares. Restricted to `from === ""` on purpose: a
      // replacement rule legitimately rewrites names that already start with
      // its target, which is exactly what `ldsg-color-` -> `ldsg-` does.
      if (from === "" && name.startsWith(to)) break
      const alias = to + name.slice(from.length)
      // An md name outranks any alias, always.
      if (definitions.has(alias)) break
      const prior = claimedBy.get(alias)
      if (prior === undefined) {
        claimedBy.set(alias, value)
        out.set(alias, value)
      } else if (prior !== value) {
        // Two md names folding onto one alias with different values is the same
        // ambiguity `readDefinitions` drops, one layer up: whichever md name
        // came first would win on declaration order alone, and the gate would
        // compare the preview against a value picked by nothing. Restating the
        // same value is fine.
        ambiguous.add(alias)
      }
      break
    }
  }
  for (const alias of ambiguous) out.delete(alias)
  return out
}

/**
 * The definitions the drift gate compares a preview against: parsed from the
 * md, then aliased to the names that slug's preview uses.
 *
 * The two steps are exported separately because their unit tests need them
 * separately, but every caller wants both — and a caller that assembled them by
 * hand could fall out of step with the one that matters. That is not a
 * hypothetical shape of bug in this file: `oklch-drift-corpus.test.ts` exists
 * because a gate can stay green while checking nothing. A test that rebuilt
 * this pipeline itself would keep passing after `scripts/audit-oklch.ts`
 * changed, and would be asserting about a pipeline nothing ships.
 */
export function definitionsForSlug(
  markdown: string,
  slug: string
): Map<string, string> {
  return alignToPreviewNames(readDefinitions(markdown), slug)
}

/**
 * Compare a LIGHT preview's custom properties against the md definitions.
 *
 * Deliberately narrow, because a loose comparison is unusable: matching token
 * names by suffix pairs `--c101-on-primary` with `primary`, and reading
 * dark-scope declarations pairs a dark value with its light-frozen token. Both
 * produce hundreds of bogus hits. Restricting to EXACT names outside any
 * `[data-theme="dark"]` block gives zero false positives across the catalogue
 * while still catching the 11st defect this was written for.
 */
export function findPreviewDrift(
  previewHtml: string,
  definitions: Map<string, string>
): Array<DriftFinding> {
  const findings: Array<DriftFinding> = []
  // Brace depth only means "CSS nesting" inside a stylesheet. Counting braces
  // across the whole document would let an inline <script> object literal or a
  // style="{…}" attribute skew the depth and quietly break the dark-scope test —
  // a silent miss in the very gate written to catch other gates' silent misses.
  const blocks = [
    ...previewHtml.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi),
  ].map((m) => m[1])
  // With no <style> at all the input is already a stylesheet — every catalogue
  // preview has one, so this only matters when checking raw CSS directly.
  const css = stripComments(blocks.length > 0 ? blocks.join("\n") : previewHtml)

  // Walk braces and declarations in document order. Deciding scope per LINE is
  // not enough: a block that opens and closes on one line would have already
  // reset by the time its own declarations were inspected.
  const TOKEN = /\[data-theme=["']?dark|\{|\}|--([\w-]+):\s*(oklch\([^)]*\))/g

  let depth = 0
  let pendingDark = false
  // Depth at which the enclosing dark block opened, or null when not in one.
  let darkDepth: number | null = null

  for (const m of css.matchAll(TOKEN)) {
    const tok = m[0]
    if (tok === "{") {
      depth++
      if (pendingDark) {
        darkDepth = depth
        pendingDark = false
      }
      continue
    }
    if (tok === "}") {
      if (darkDepth === depth) darkDepth = null
      depth--
      continue
    }
    if (tok.startsWith("[")) {
      // A dark selector — the block it scopes opens at the next brace.
      pendingDark = true
      continue
    }
    if (darkDepth !== null) continue

    const expected = definitions.get(m[1])
    if (expected === undefined) continue
    const preview = normalise(m[2])
    if (preview !== expected) {
      findings.push({ name: m[1], preview, expected })
    }
  }
  return findings
}
