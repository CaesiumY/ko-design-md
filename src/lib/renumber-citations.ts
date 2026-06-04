// Renumbers a design.md's `## References` after removing some entries (e.g.
// label-only ephemeral sources), shifting every body `[src:N]` to match.
//
// Manual renumbering across many files reliably produces mis-citations
// (see memory: PR #105), so this is the single mechanical primitive the
// label-only migration builds on. It REPORTS removed refs that are still cited
// (`unresolvedRemovedCitations`) rather than silently dropping them — the caller
// must first clear those citations (move to a public source or delete the claim)
// so no body claim is left pointing at a deleted reference.
//
// Pure function — reuses parseReferences() so the renumberer and the validator
// share one interpretation of the References block.

import { parseReferences } from "./source-citations"

export type RenumberResult = {
  body: string
  mapping: ReadonlyArray<{ from: number; to: number }>
  unresolvedRemovedCitations: ReadonlyArray<number>
}

export function renumberReferences(
  body: string,
  removeRefs: ReadonlyArray<number>,
): RenumberResult {
  const removeSet = new Set(removeRefs)
  const refs = parseReferences(body)
  const keep = refs.filter((r) => !removeSet.has(r.num))
  const mapping = keep.map((r, i) => ({ from: r.num, to: i + 1 }))
  const fromTo = new Map(mapping.map((m) => [m.from, m.to]))
  const unresolved = new Set<number>()

  const replaceCites = (text: string): string =>
    text.replace(/\[src:(\d+)\]/g, (match, digits) => {
      const n = Number(digits)
      if (removeSet.has(n)) {
        unresolved.add(n)
        return match // leave it; caller must clear it first
      }
      const to = fromTo.get(n)
      return to ? `[src:${to}]` : match
    })

  const lines = body.split(/\r?\n/)
  const refStart = lines.findIndex((l) => /^##\s+References\s*$/.test(l.trim()))

  const result = (newBody: string): RenumberResult => ({
    body: newBody,
    mapping,
    unresolvedRemovedCitations: [...unresolved].sort((a, b) => a - b),
  })

  if (refStart === -1) return result(replaceCites(body))

  const head = lines.slice(0, refStart).map(replaceCites)
  const newRefLines = keep.map((r, i) => `${i + 1}. ${r.text}`)
  return result([...head, "## References", "", ...newRefLines, ""].join("\n"))
}
