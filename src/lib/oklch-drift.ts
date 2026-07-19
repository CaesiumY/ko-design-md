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

/** `name: oklch(…)` definitions in a design.md, normalised for comparison. */
export function readDefinitions(markdown: string): Map<string, string> {
  const out = new Map<string, string>()
  for (const m of markdown.matchAll(/^([a-z][\w-]*):\s+(oklch\([^)]*\))/gm)) {
    out.set(m[1], normalise(m[2]))
  }
  return out
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
  // Walk braces and declarations in document order. Deciding scope per LINE is
  // not enough: a block that opens and closes on one line would have already
  // reset by the time its own declarations were inspected.
  const TOKEN = /\[data-theme=["']?dark|\{|\}|--([\w-]+):\s*(oklch\([^)]*\))/g

  let depth = 0
  let pendingDark = false
  // Depth at which the enclosing dark block opened, or null when not in one.
  let darkDepth: number | null = null

  for (const m of previewHtml.matchAll(TOKEN)) {
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
