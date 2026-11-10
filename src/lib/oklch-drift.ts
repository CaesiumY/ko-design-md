import { html, parse } from "parse5"
import { findKey, readFrontmatter } from "./frontmatter"
import { splitFrontmatter } from "./frontmatter-fence"
import { LEADING_OKLCH, oklchEntries } from "./oklch-sync"
import type { DefaultTreeAdapterTypes } from "parse5"
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
 * Every `name: oklch(…)` definition, in document order, duplicates included.
 *
 * A document with a frontmatter is read through `readFrontmatter` — the one
 * reader every consumer shares (docs/adr/0011) — so a quoted or deeply indented
 * value counts as YAML reads it, and a block scalar's text does not count at
 * all. A frontmatter YAML cannot read yields nothing: `frontmatter-yaml-invalid`
 * names that cause, and a guess at a broken block would only add findings built
 * on a misreading. The body is never read when a frontmatter exists.
 *
 * Text with no frontmatter block is read as a body: the validator hands this a
 * document's body to warn on pre-migration token fences, and such text has no
 * frontmatter to read. That path is a line scan by necessity — it is not
 * frontmatter.
 */
function allDefinitions(markdown: string): Array<[string, string]> {
  if (splitFrontmatter(markdown) === null) return bodyDefinitions(markdown)
  const read = readFrontmatter(markdown)
  if (!read.ok) return []
  return oklchEntries(read.keys).flatMap((entry) => {
    const literal = entry.value.match(LEADING_OKLCH)
    return literal ? [[entry.key, normalise(literal[0])]] : []
  })
}

/** `name: oklch(…)` lines in text that has no frontmatter. */
function bodyDefinitions(text: string): Array<[string, string]> {
  return [
    ...text.matchAll(/^[ \t]*([a-z][\w-]*):[ \t]+(oklch\([^)]*\))/gm),
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
  banksalad: [["", "bs-"]],
  // bezier's preview is hex, so no value comparison reaches it; these rules
  // serve the role-chain check. Its role properties keep their bare md names
  // (`--fill-grey`) and only the palette families are prefixed (`--c-grey-50`),
  // so there is one rule per family and no catch-all.
  bezier: [
    "blue",
    "cobalt",
    "green",
    "grey",
    "navy",
    "olive",
    "orange",
    "pink",
    "purple",
    "red",
    "teal",
    "yellow",
  ].map((family) => [`${family}-`, `c-${family}-`] as const),
  chzzk: [["", "chz-"]],
  class101: [["", "c101-"]],
  // codeit's preview names roles as its docs do (`--ci-txt-*`, `--ci-bg-*`)
  // where the md rows use the bundle's `text-*` and `background-*`, and
  // declares one palette (`--ci-purple-80`) whose light values are the md's
  // `light-` steps and which its dark block redefines. The `dark-` steps get no
  // rule here: roleChainsForSlug names them for the dark scope itself.
  codeit: [
    ["codeit-", "ci-"],
    ["text-", "ci-txt-"],
    ["background-", "ci-bg-"],
    ["light-", "ci-"],
    ["", "ci-"],
  ],
  gmarket: [["", "gds-"]],
  greeting: [
    ["gray", "g-gray-"],
    ["", "g-"],
  ],
  "gs-retail": [["", "gsr-"]],
  "gs-shop": [["", "gs-"]],
  krds: [["", "krds-"]],
  kyobobook: [["", "kds-"]],
  laftel: [["", "lft-"]],
  "lg-electronics": [["", "lg-"]],
  likelion: [["", "ll-"]],
  "line-design-system": [
    ["ldsg-color-", "ldsg-"],
    ["", "ldsg-"],
  ],
  // The published palette already carries the `nol-` prefix (`nol-blue`), and
  // the catch-all deliberately skips a name that starts with its target — so
  // the preview's `--nol-nol-blue` needs its own rule ahead of it.
  nol: [
    ["nol-", "nol-nol-"],
    ["", "nol-"],
  ],
  remember: [["", "rui-"]],
  ridi: [["", "ridi-"]],
  "seed-design": [["", "seed-"]],
  socar: [["", "sf-"]],
  teamsparta: [["", "sp-"]],
  toss: [["", "tds-"]],
  // The role layer's `color-background-*` and the rest are written short in
  // the preview (`--vp-bg-primary-100`).
  "vapor-ui": [
    ["color-background-", "vp-bg-"],
    ["color-foreground-", "vp-fg-"],
    ["color-border-", "vp-border-"],
    ["", "vp-"],
  ],
  wanted: [["", "w-"]],
  yeogi: [
    ["yeogi-", "yg-"],
    ["", "yg-"],
  ],
  zigbang: [["", "zg-"]],
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
 * and md already agree). `bezier`'s rules reach no value here — its preview
 * declares no `oklch` at all, it is hex — and serve the role-chain check.
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
  const claimedBy = new Map<string, string>()
  const ambiguous = new Set<string>()
  for (const [name, value] of definitions) {
    const alias = aliasFor(name, slug)
    // An md name outranks any alias, always.
    if (alias === undefined || definitions.has(alias)) continue
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
  }
  for (const alias of ambiguous) out.delete(alias)
  return out
}

/**
 * The name `slug`'s preview gives md name `name` by its first matching rule in
 * `PREVIEW_TOKEN_ALIASES`, or `undefined` when no rule renames it.
 */
function aliasFor(name: string, slug: string): string | undefined {
  for (const [from, to] of PREVIEW_TOKEN_ALIASES[slug] ?? []) {
    if (from !== "" && !name.startsWith(from)) continue
    // A catch-all prepend must not double a namespace the md name already
    // carries — `c101-primary` would otherwise gain `c101-c101-primary`, a
    // name no preview declares. Restricted to `from === ""` on purpose: a
    // replacement rule legitimately rewrites names that already start with
    // its target, which is exactly what `ldsg-color-` -> `ldsg-` does.
    if (from === "" && name.startsWith(to)) return undefined
    return to + name.slice(from.length)
  }
  return undefined
}

/**
 * Reference rows in a design.md's frontmatter `colors:` map — a key whose value
 * is exactly `{colors.<key>}` — as key → the key it points at.
 *
 * `readDefinitions` reads only `oklch(…)` values, so these rows (the role layer
 * the entry publishes, docs/adr/0012, and the #381 `primary` alias) never
 * reached the drift gate. A frontmatter YAML cannot read yields nothing, as it
 * does there.
 */
export function readReferenceRows(markdown: string): Map<string, string> {
  const out = new Map<string, string>()
  const read = readFrontmatter(markdown)
  if (!read.ok) return out
  const colors = findKey(read.keys, "colors")?.value
  if (colors === null || typeof colors !== "object" || Array.isArray(colors))
    return out
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value !== "string") continue
    const target = /^\{colors\.([^}]+)\}$/.exec(value)?.[1]
    if (target !== undefined) out.set(key, target)
  }
  return out
}

/**
 * Per theme scope, preview role property → the palette properties its `var()`
 * may point at (the first is the one a finding names).
 */
export interface RoleChains {
  light: Map<string, ReadonlyArray<string>>
  dark: Map<string, ReadonlyArray<string>>
  /** Dark roles that come from a `dark-` row (not theme-invariant ones). */
  paired: Set<string>
  /**
   * Dark role → the candidate read off its `dark-` palette key without the
   * prefix. It names the dark value only where the dark theme root redeclares
   * that step, so it is accepted only there.
   */
  rebound: Map<string, string>
}

/**
 * Which palette property each role property of `slug`'s preview must point at,
 * per theme scope, read from the md reference rows and renamed by the same
 * `PREVIEW_TOKEN_ALIASES` rules the value comparison uses.
 *
 * A `dark-` row (the one spelling the catalogue uses for a dark twin, #625) is
 * the role's dark-scope target. A row with no `dark-` twin is the same role in
 * both themes (a theme-invariant role, or a light-only system), so its dark
 * redeclaration, when the preview writes one as a `var()`, must point at the
 * same step. A preview that invents dark values for a light-only system writes
 * them as literals, which `findRoleChainDrift` does not compare.
 *
 * A dark row may point at a `dark-` palette key (`{colors.dark-gray-050}`,
 * vapor-ui and codeit). Their previews declare one palette and redefine its
 * steps in the dark block, so in the dark scope the unprefixed step's name
 * (`--vp-gray-050`) is accepted as well as the prefixed one, provided the dark
 * theme root redeclares it. This is not an alias rule on purpose: a `dark-`
 * rule would fold `gray-050` and `dark-gray-050` onto one name, which
 * alignToPreviewNames drops as ambiguous, and the light palette comparisons
 * would go with it.
 */
export function roleChainsForSlug(markdown: string, slug: string): RoleChains {
  const rows = readReferenceRows(markdown)
  const name = (key: string): string => aliasFor(key, slug) ?? key
  const light = new Map<string, ReadonlyArray<string>>()
  const dark = new Map<string, ReadonlyArray<string>>()
  const paired = new Set<string>()
  const rebound = new Map<string, string>()
  for (const [key, target] of rows) {
    if (key.startsWith("dark-")) {
      const role = name(key.slice("dark-".length))
      paired.add(role)
      if (target.startsWith("dark-")) {
        const step = name(target.slice("dark-".length))
        rebound.set(role, step)
        dark.set(role, [step, name(target)])
      } else {
        dark.set(role, [name(target)])
      }
      continue
    }
    light.set(name(key), [name(target)])
    if (!rows.has(`dark-${key}`)) dark.set(name(key), [name(target)])
  }
  return { light, dark, paired, rebound }
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
  for (const { name, value, dark } of declarations(previewHtml)) {
    if (dark) continue
    const literal = /^oklch\([^)]*\)/.exec(value)?.[0]
    if (literal === undefined) continue
    const expected = definitions.get(name)
    if (expected === undefined) continue
    const preview = normalise(literal)
    if (preview !== expected) findings.push({ name, preview, expected })
  }
  return findings
}

export interface RoleChainFinding extends DriftFinding {
  scope: "light" | "dark"
  /**
   * Set when one role is declared under two theme-root forms in one scope, or
   * at the light root after the dark root: which declaration wins then depends
   * on selector weight and order, and the check refuses to pick one. `preview`
   * names the declarations.
   */
  ambiguous?: true
}

/**
 * Compare where a preview's role properties point against the md reference
 * rows (`roleChainsForSlug`), in both theme scopes.
 *
 * Only a declaration that is exactly one `var(--x)` is compared. A literal is
 * not a chain (bezier writes its opacity roles as `rgba(…)`, and a preview may
 * invent dark values for a light-only system), so it is left out, not
 * reported. `roleChainCoverage` counts both kinds, and
 * `oklch-drift-corpus.test.ts` pins those counts per slug, so a role whose
 * `var()` becomes a literal, or a role newly declared as a literal, moves a
 * pinned number.
 *
 * Only THEME-ROOT declarations are the theme's value, and the theme roots are
 * an exact list (THEME_ROOTS): `:root` and `html` for light,
 * `[data-theme="dark"]`, `:root[data-theme="dark"]` and
 * `html[data-theme="dark"]` for dark, each in a top-level block outside any
 * at-rule, in a `<style>` element whose `media` is absent, empty or `all` (any
 * other media is treated as conditional, `screen` included) and that is not
 * inside `<template>`. The `<style>` elements are found by an HTML parser
 * with scripting on, as in the browser (styleBlocks): one inside an HTML
 * comment, a raw-text element (`<script>`, `<textarea>`, `<title>`,
 * `<noscript>`, …) or a quoted attribute value, or one whose `type` is set to
 * anything but empty or `text/css`, is not read at all; a `<!--` inside an
 * HTML `<style>` body is CSS, while inside an `<svg>` one it opens a comment. A role declared under any other selector
 * (`.inverse`, `:where(.chip)`, `[data-theme="sepia"]`, `:root` inside
 * `@media`) is neither compared nor allowed to hide the root value;
 * `roleChainCoverage` counts it as `scoped`.
 *
 * Within one scope and one root form, the last declaration is compared: the
 * same selector, so document order decides. codeit's merged preview restates
 * its light tokens under `[data-theme="dark"]` and then overrides them in a
 * second block of that selector. A role declared under two different root
 * forms in one scope (`:root` and `html`), or at the light root after the dark
 * root (where the later `:root` would also win in the dark theme), is reported
 * as ambiguous instead of guessed at.
 *
 * A role with a `dark-` row that the dark root never redeclares inherits its
 * light `var()` in the dark theme; that declaration is held to the dark row as
 * well. A dark target named without its `dark-` prefix counts only where the
 * dark root redeclares that step (RoleChains.rebound).
 */
export function findRoleChainDrift(
  previewHtml: string,
  chains: RoleChains
): Array<RoleChainFinding> {
  const { compared, ambiguous } = roleDeclarations(previewHtml, chains)
  const findings: Array<RoleChainFinding> = ambiguous.map((a) => ({
    name: a.name,
    scope: a.dark ? "dark" : "light",
    preview: a.declarations
      .map((d) => `${d.root ?? ""} { --${d.name}: ${d.value} }`)
      .join(" and "),
    expected: "one theme-root declaration",
    ambiguous: true,
  }))
  for (const { name, dark, target, expected } of compared) {
    if (target === undefined || expected.includes(target)) continue
    findings.push({
      name,
      scope: dark ? "dark" : "light",
      preview: `var(--${target})`,
      expected: `var(--${expected[0]})`,
    })
  }
  return findings
}

/**
 * How many role properties the role-chain check compares (`chained`, wired by
 * one `var()`), how many theme-root ones it leaves out as literals (`literal`),
 * counting each scope's last theme-root declaration once, and how many role
 * declarations sit outside a theme-root block (`scoped`), each counted.
 */
export function roleChainCoverage(
  previewHtml: string,
  chains: RoleChains
): { chained: number; literal: number; scoped: number } {
  const { compared, scoped } = roleDeclarations(previewHtml, chains)
  const chained = compared.filter((d) => d.target !== undefined).length
  return { chained, literal: compared.length - chained, scoped }
}

/**
 * Each scope's last theme-root declaration of a role property `chains` names,
 * with the property its `var()` points at (`undefined` for a literal) and the
 * steps it may point at; the roles whose theme-root declarations are
 * ambiguous; and the number of role declarations outside theme-root blocks.
 *
 * A role with a `dark-` row that the dark theme root never redeclares inherits
 * its light declaration in the dark theme, so that declaration is compared
 * against the dark row too (`inherited`).
 */
function roleDeclarations(
  previewHtml: string,
  chains: RoleChains
): {
  compared: Array<
    Declaration & {
      target: string | undefined
      expected: ReadonlyArray<string>
      inherited: boolean
    }
  >
  ambiguous: Array<{
    name: string
    dark: boolean
    declarations: ReadonlyArray<Declaration>
  }>
  scoped: number
} {
  // Every theme-root declaration of each property, per scope, in order.
  const atRoot = new Map<string, Array<Declaration>>()
  const isRole = (d: Declaration): boolean =>
    (d.dark ? chains.dark : chains.light).has(d.name)
  // Roles declared at the light root after a dark-root declaration of theirs.
  const lightAfterDark = new Set<string>()
  let scoped = 0
  for (const d of declarations(previewHtml)) {
    if (d.root === undefined) {
      if (isRole(d)) scoped++
      continue
    }
    if (!d.dark && atRoot.has(`dark ${d.name}`)) lightAfterDark.add(d.name)
    const key = `${d.dark ? "dark" : "light"} ${d.name}`
    const list = atRoot.get(key) ?? []
    list.push(d)
    // Delete first so the map's order is where each property is last declared.
    atRoot.delete(key)
    atRoot.set(key, list)
  }
  const lastAt = (key: string): Declaration | undefined =>
    atRoot.get(key)?.at(-1)
  const darkRedeclares = (step: string): boolean => atRoot.has(`dark ${step}`)
  const entry = (
    d: Declaration,
    scope: "light" | "dark",
    inherited: boolean
  ) => {
    const candidates = (scope === "dark" ? chains.dark : chains.light).get(
      d.name
    )
    if (candidates === undefined) return []
    const rebound = scope === "dark" ? chains.rebound.get(d.name) : undefined
    const expected = candidates.filter(
      (step) => step !== rebound || darkRedeclares(step)
    )
    return [
      {
        ...d,
        dark: scope === "dark",
        target: /^var\(\s*--([\w-]+)\s*\)$/.exec(d.value)?.[1],
        expected,
        inherited,
      },
    ]
  }
  const ambiguous: Array<{
    name: string
    dark: boolean
    declarations: ReadonlyArray<Declaration>
  }> = []
  const compared = []
  for (const list of atRoot.values()) {
    const last = list[list.length - 1]
    if (!isRole(last)) continue
    const forms = new Set(list.map((d) => d.root))
    const late = !last.dark && lightAfterDark.has(last.name)
    if (forms.size > 1 || late) {
      const dark = atRoot.get(`dark ${last.name}`) ?? []
      ambiguous.push({
        name: last.name,
        dark: last.dark,
        declarations: forms.size > 1 ? list : [...dark, last],
      })
      continue
    }
    compared.push(...entry(last, last.dark ? "dark" : "light", false))
  }
  for (const role of chains.paired) {
    const base = lastAt(`light ${role}`)
    if (base === undefined || atRoot.has(`dark ${role}`)) continue
    compared.push(...entry(base, "dark", true))
  }
  return { compared, ambiguous, scoped }
}

/** One custom-property declaration in a preview's stylesheets. */
interface Declaration {
  name: string
  /** Trimmed. */
  value: string
  /** Inside a `[data-theme="dark"]` block. */
  dark: boolean
  /** The theme-root selector its block is (THEME_ROOTS), or undefined. */
  root: string | undefined
}

/**
 * The selectors a theme's value is declared under, exactly, as
 * normaliseSelector writes them. Anything else is scoped.
 */
const THEME_ROOTS = {
  light: new Set([
    ":root",
    "html",
    // gmarket's preview declares its light tokens under this selector list.
    ':root,[data-theme="light"]',
  ]),
  dark: new Set([
    '[data-theme="dark"]',
    ':root[data-theme="dark"]',
    'html[data-theme="dark"]',
  ]),
}

/**
 * A block's selector with whitespace collapsed and removed only where it
 * cannot be a combinator: inside `[…]` and around `,`. Space before `[` or
 * after `]` is the descendant combinator and is kept. An attribute value is
 * written in double quotes.
 */
function normaliseSelector(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\[([^\]]*)\]/g, (_, inner: string) => {
      const attr = /^([\w-]+)=["']?([^"']*)["']?$/.exec(inner.replace(/ /g, ""))
      return attr ? `[${attr[1]}="${attr[2]}"]` : `[${inner.replace(/ /g, "")}]`
    })
    .replace(/ ?, ?/g, ",")
    .trim()
}

/**
 * The bodies of a preview's applied `<style>` elements, in document order, as
 * a browser's HTML parser finds them. An HTML comment, a raw-text element
 * (`<script>`, `<textarea>`, `<title>`, `<noscript>`, …) and a quoted
 * attribute value are text, so a `<style>` written inside one is not a
 * stylesheet, while a custom element such as `<title-card>` is ordinary
 * markup. A `<style>` whose `type` names anything but CSS is skipped.
 *
 * An HTML `<style>` is raw text itself, so a `<!--` in its body is CSS, not a
 * comment. Inside `<svg>` (foreign content) a `<style>` holds markup: a `<!--`
 * there opens a real comment, whose CSS does not apply, entities are decoded
 * and a CDATA section is text. Only the element's own text children are its
 * stylesheet, as the browser reads it.
 *
 * parse5 follows the HTML parser before Chromium's customizable `<select>`:
 * inside `<select>` it drops every start tag but a few, so a `<style>` there,
 * which Chromium 153 applies, is lost, and a raw-text element such as
 * `<noscript>` loses its tag and lets its content read as markup. Rather than
 * pass a value the screen paints, this throws when a `<select>`'s source holds
 * any other start tag, even as text in a comment, a script or an attribute
 * value. Catalogue previews put only `<option>` there.
 *
 * A `<style>` that applies only conditionally (a `media` attribute, or inside
 * `<template>`) is wrapped in an at-rule here, so its declarations are never
 * a theme root, as an `@media` block's are not.
 */
function styleBlocks(previewHtml: string): Array<string> {
  // parse5 is the parser inside jsdom, used directly for two reasons. Its
  // scripting flag is on by default, as in the browser and the Chromium that
  // measures contrast, so `<noscript>` content is raw text; jsdom parses with
  // scripting off unless scripts may run. And it builds no CSSOM, which made
  // jsdom twice as slow here. Only scripts and validators import this module,
  // so a devDependency is enough.
  const document = parse(previewHtml, { sourceCodeLocationInfo: true })
  const blocks: Array<string> = []
  const walk = (
    parent: DefaultTreeAdapterTypes.ParentNode,
    conditional: boolean
  ): void => {
    for (const node of parent.childNodes) {
      if (!("tagName" in node)) continue
      // The parser drops most start tags inside <select>, so the tree cannot
      // show them; the element's own source can.
      if (node.tagName === "select" && node.namespaceURI === html.NS.HTML) {
        // With no source location the check cannot look, so it stops too.
        const at = node.sourceCodeLocation
        const inner = at
          ? previewHtml.slice(
              at.startTag?.endOffset ?? at.startOffset,
              at.endTag?.startOffset ?? at.endOffset
            )
          : "<style>"
        // The tags the older "in select" rules keep or act on.
        const kept = new Set([
          "option",
          "optgroup",
          "hr",
          "select",
          "input",
          "keygen",
          "textarea",
          "script",
          "template",
        ])
        const dropped = [...inner.matchAll(/<([a-z][^\s/>]*)/gi)]
          .map((m) => m[1].toLowerCase())
          .find((tag) => !kept.has(tag))
        if (dropped !== undefined)
          throw new Error(
            `<select> holds <${dropped}>, which parse5 drops while Chromium 153 keeps it, so this check cannot read the page as the browser does. ` +
              `Move the <${dropped}> out of the <select> (a <style> goes into <head>). ` +
              "Text spelling a tag inside the <select> (a comment, a script string, an attribute value) stops the check too; reword it."
          )
      }
      // A <template>'s markup is its content fragment, not its children. Inside
      // <svg> or <math> the tag is a foreign element with no fragment, so it is
      // walked like any other element (preview-halves.ts makes the same cut).
      if (node.tagName === "template" && node.namespaceURI === html.NS.HTML) {
        walk((node as DefaultTreeAdapterTypes.Template).content, true)
        continue
      }
      if (node.tagName !== "style") {
        walk(node, conditional)
        continue
      }
      // A browser applies an HTML or SVG <style>; one parsed inside <math> is a
      // MathML element, not a stylesheet. Its children are still walked: an
      // <mi> or <mtext> inside it returns to HTML, and a <style> there applies.
      if (
        node.namespaceURI !== html.NS.HTML &&
        node.namespaceURI !== html.NS.SVG
      ) {
        walk(node, conditional)
        continue
      }
      // A <style> applies when its type is absent, empty or `text/css`, as the
      // HTML spec has it. Any media other than absent, empty or `all` is
      // treated as conditional: the query is not evaluated, so even `screen`
      // is.
      const attr = (name: string): string | undefined =>
        node.attrs
          .find((a) => a.name === name && a.namespace === undefined)
          ?.value.trim()
          .toLowerCase()
      const type = attr("type")
      const isCss = type === undefined || type === "" || type === "text/css"
      const media = attr("media")
      const applies =
        !conditional && (media === undefined || media === "" || media === "all")
      const text = node.childNodes
        .map((child) =>
          child.nodeName === "#text"
            ? (child as DefaultTreeAdapterTypes.TextNode).value
            : ""
        )
        .join("")
      // CSS drops CDO and CDC (`<!--`, `-->`) as tokens; blanked to spaces.
      const body = text.replace(/<!--|-->/g, (t) => " ".repeat(t.length))
      if (isCss)
        blocks.push(applies ? body : `@conditional-style {\n${body}\n}`)
      // An SVG <style> holds markup, so an element inside it may hold another
      // stylesheet (an HTML <style> is raw text and has no element children).
      walk(node, conditional)
    }
  }
  walk(document, false)
  return blocks
}

/** Every custom-property declaration in a preview's stylesheets, in order. */
function declarations(previewHtml: string): Array<Declaration> {
  // Brace depth only means "CSS nesting" inside a stylesheet. Counting braces
  // across the whole document would let an inline <script> object literal or a
  // style="{…}" attribute skew the depth and quietly break the dark-scope test —
  // a silent miss in the very gate written to catch other gates' silent misses.
  //
  // With no <style> tag at all the input is already a stylesheet — every
  // catalogue preview has one, so this only matters when checking raw CSS
  // directly. A document whose only <style> tags are dead reads as empty.
  const css = stripComments(
    /<style\b/i.test(previewHtml)
      ? styleBlocks(previewHtml).join("\n")
      : previewHtml
  )

  // Walk braces and declarations in document order. Deciding scope per LINE is
  // not enough: a block that opens and closes on one line would have already
  // reset by the time its own declarations were inspected. `;` is a token only
  // so that the text before each `{` — its selector — can be read back.
  const TOKEN = /\[data-theme=["']?dark|\{|\}|;|--([\w-]+)\s*:([^;{}]*)/g

  const out: Array<Declaration> = []
  let pendingDark = false
  // Depth at which the enclosing dark block opened, or null when not in one.
  let darkDepth: number | null = null
  // The selector (or at-rule prelude) of each open block, outermost first.
  const open: Array<string> = []
  // Where the text since the last `{`, `}` or `;` starts.
  let segment = 0

  for (const m of css.matchAll(TOKEN)) {
    const tok = m[0]
    const end = m.index + tok.length
    if (tok === "{") {
      open.push(normaliseSelector(css.slice(segment, m.index)))
      if (pendingDark) {
        darkDepth = open.length
        pendingDark = false
      }
      segment = end
      continue
    }
    if (tok === "}") {
      if (darkDepth === open.length) darkDepth = null
      open.pop()
      segment = end
      continue
    }
    if (tok === ";") {
      segment = end
      continue
    }
    if (tok.startsWith("[")) {
      // A dark selector — the block it scopes opens at the next brace.
      pendingDark = true
      continue
    }
    out.push({
      name: m[1],
      value: m[2].trim(),
      dark: darkDepth !== null,
      root:
        open.length === 1 &&
        THEME_ROOTS[darkDepth !== null ? "dark" : "light"].has(open[0])
          ? open[0]
          : undefined,
    })
  }
  return out
}
