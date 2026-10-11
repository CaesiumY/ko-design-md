// How `pnpm validate:spec` prints a lint run. Kept apart from the entry script
// (which lints on import) so the printing can be tested on its own.

export interface EntryReport {
  slug: string
  errors: number
  warnings: number
  infos: number
  tokens: {
    colors: number
    typography: number
    spacing: number
    rounded: number
  }
  findings: Array<{
    severity: string
    rule: string
    path?: string
    message: string
  }>
}

// Rules whose warnings are counted but not listed unless `--verbose` (#388). `orphaned-tokens`
// wakes once an entry carries a `components:` map and then warns on every
// color no component references. The catalog records a brand's whole palette
// where the linter expects a design system to declare only the colors it uses,
// so no realistic component map brings it to zero — the warning is a structural
// difference, never a fix to make. The count stays in the entry's status line
// and the total; `--json-out` keeps every finding.
//
// The evidence the decision was taken on, as of then (it grows with every
// entry that adds components): the #384 pilot (teamsparta, PR #422) recorded
// 27 of the catalog's 41 warnings; at #388 it was 27 of 44, filling 27 of the
// 77 lines this command printed, and #388 cites 60–106 per entry in
// experiments on other entries. Revisit if a rule listed here ever starts
// carrying findings someone has to act on.
export const SUMMARIZED_RULES: ReadonlyMap<string, string> = new Map([
  ["orphaned-tokens", "colors no component references"],
])

export function formatSpecReport(
  reports: ReadonlyArray<EntryReport>,
  { verbose }: { verbose: boolean }
): Array<string> {
  const lines: Array<string> = []
  let totalErrors = 0
  let totalWarnings = 0
  const heldBack = new Map<string, number>()

  for (const r of reports) {
    totalErrors += r.errors
    totalWarnings += r.warnings
    const t = r.tokens
    const counts = `${t.colors}c/${t.typography}t/${t.spacing}s/${t.rounded}r`
    const label = `${r.slug.padEnd(20)} ${counts.padEnd(18)}`
    if (r.errors)
      lines.push(`FAIL ${label} (${r.errors} error, ${r.warnings} warn)`)
    else if (r.warnings) lines.push(`warn ${label} (${r.warnings} warn)`)
    else lines.push(`ok   ${label}`)

    // Only warnings are folded. The case for folding is that the warning is
    // never a fix to make; an error under the same name (a linter upgrade
    // could raise one) is exactly what this command exists to diagnose, so it
    // is always listed.
    const entryHeld = new Map<string, number>()
    for (const f of r.findings) {
      if (f.severity === "info" && !verbose) continue
      if (
        f.severity === "warning" &&
        SUMMARIZED_RULES.has(f.rule) &&
        !verbose
      ) {
        entryHeld.set(f.rule, (entryHeld.get(f.rule) ?? 0) + 1)
        continue
      }
      const where = f.path ? ` (${f.path})` : ""
      lines.push(
        `       ${f.severity.padEnd(7)} [${f.rule}]${where} ${f.message}`
      )
    }
    for (const [rule, n] of entryHeld) {
      lines.push(
        `       ${"warning".padEnd(7)} [${rule}] ×${n} — not listed (${SUMMARIZED_RULES.get(rule)}; --verbose to list)`
      )
      heldBack.set(rule, (heldBack.get(rule) ?? 0) + n)
    }
  }

  const held = [...heldBack]
    .map(([rule, n]) => `${n} ${rule} not listed`)
    .join(", ")
  lines.push(
    `\n[spec] ${reports.length} entr${reports.length === 1 ? "y" : "ies"} — ` +
      `${totalErrors} error, ${totalWarnings} warning finding(s)` +
      (held ? ` (${held}).` : ".")
  )
  return lines
}
