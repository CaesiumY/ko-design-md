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
//
// Assumes `## References` is the LAST section of the doc (the catalog standard
// per stitch-format.md). Lines after the References block are NOT preserved —
// the body up to References is kept, then the renumbered References list is
// appended. Do not use on docs that have sections after References.

import { parseReferences } from "./source-citations"

export type RenumberResult = {
  body: string
  mapping: ReadonlyArray<{ from: number; to: number }>
  unresolvedRemovedCitations: ReadonlyArray<number>
}

export function renumberReferences(
  body: string,
  removeRefs: ReadonlyArray<number>,
  opts: { unlink?: boolean } = {},
): RenumberResult {
  const removeSet = new Set(removeRefs)
  const refs = parseReferences(body)
  const keep = refs.filter((r) => !removeSet.has(r.num))
  const mapping = keep.map((r, i) => ({ from: r.num, to: i + 1 }))
  const fromTo = new Map(mapping.map((m) => [m.from, m.to]))
  const unresolved = new Set<number>()
  const shift = (n: number): number => fromTo.get(n) ?? n

  // Default mode: shift kept citations, report removed-but-still-cited ones.
  const shiftCites = (text: string): string =>
    text.replace(/\[src:(\d+)\]/g, (match, digits) => {
      const n = Number(digits)
      if (removeSet.has(n)) {
        unresolved.add(n)
        return match // leave it; caller must clear it first
      }
      return `[src:${shift(n)}]`
    })

  // unlink mode: drop removed-ref citations from each citation group. If the
  // whole group is removed the leading whitespace goes too (solo → uncited);
  // survivors stay and are renumbered (accompanied → keeps the public ref).
  const citeNum = (c: string): number => Number(c.replace(/\D/g, ""))
  const unlinkCites = (text: string): string =>
    text.replace(/(\s*)((?:\[src:\d+\])+)/g, (_m, ws: string, grp: string) => {
      const kept = (grp.match(/\[src:\d+\]/g) ?? []).filter(
        (c) => !removeSet.has(citeNum(c)),
      )
      if (kept.length === 0) return ""
      return ws + kept.map((c) => `[src:${shift(citeNum(c))}]`).join("")
    })

  const transform = opts.unlink ? unlinkCites : shiftCites

  const lines = body.split(/\r?\n/)
  const refStart = lines.findIndex((l) => /^##\s+References\s*$/.test(l.trim()))

  const result = (newBody: string): RenumberResult => ({
    body: newBody,
    mapping,
    unresolvedRemovedCitations: [...unresolved].sort((a, b) => a - b),
  })

  if (refStart === -1) return result(transform(body))

  const head = lines.slice(0, refStart).map(transform)
  const newRefLines = keep.map((r, i) => `${i + 1}. ${r.text}`)
  return result([...head, "## References", "", ...newRefLines, ""].join("\n"))
}
