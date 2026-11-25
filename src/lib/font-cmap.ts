import { brotliDecompressSync } from "node:zlib"

// Reads the set of code points a font file covers, from its `cmap` table.
// Only what `suit-coverage-corpus.test.ts` needs: WOFF2 and plain sfnt (TTF/OTF)
// containers, `cmap` subtable formats 4 and 12 (the two that carry the BMP and
// the full Unicode range). No glyph outlines are decoded.
//
// WOFF2 keeps `cmap` untransformed, so it only takes unpacking the container:
// a table directory, then one Brotli stream holding every table back to back.

// Table tags a WOFF2 directory entry can name by index instead of spelling out
// (W3C WOFF2 §5.1). Only the order up to the first spelled-out tag matters here.
const KNOWN_TAGS = [
  "cmap",
  "head",
  "hhea",
  "hmtx",
  "maxp",
  "name",
  "OS/2",
  "post",
  "cvt ",
  "fpgm",
  "glyf",
  "loca",
  "prep",
  "CFF ",
  "VORG",
  "EBDT",
  "EBLC",
  "gasp",
  "hdmx",
  "kern",
  "LTSH",
  "PCLT",
  "VDMX",
  "vhea",
  "vmtx",
  "BASE",
  "GDEF",
  "GPOS",
  "GSUB",
  "EBSC",
  "JSTF",
  "MATH",
  "CBDT",
  "CBLC",
  "COLR",
  "CPAL",
  "SVG ",
  "sbix",
  "acnt",
  "avar",
  "bdat",
  "bloc",
  "bsln",
  "cvar",
  "fdsc",
  "feat",
  "fmtx",
  "fvar",
  "gvar",
  "hsty",
  "just",
  "lcar",
  "mort",
  "morx",
  "opbd",
  "prop",
  "trak",
  "Zapf",
  "Silf",
  "Glat",
  "Gloc",
  "Feat",
  "Sill",
] as const

const SPELLED_OUT_TAG = 0x3f

function readBase128(buf: Buffer, start: number): [number, number] {
  let value = 0
  let pos = start
  for (let i = 0; i < 5; i++) {
    const byte = buf.readUInt8(pos++)
    value = value * 128 + (byte & 0x7f)
    if ((byte & 0x80) === 0) return [value, pos]
  }
  throw new Error("WOFF2: UIntBase128 is longer than 5 bytes")
}

function cmapFromWoff2(buf: Buffer): Buffer {
  const numTables = buf.readUInt16BE(12)
  const compressedLength = buf.readUInt32BE(20)
  let pos = 48
  const tables: Array<{ tag: string; length: number }> = []
  for (let i = 0; i < numTables; i++) {
    const flags = buf.readUInt8(pos++)
    let tag: string
    if ((flags & 0x3f) === SPELLED_OUT_TAG) {
      tag = buf.toString("ascii", pos, pos + 4)
      pos += 4
    } else {
      tag = KNOWN_TAGS[flags & 0x3f] ?? ""
    }
    const transformVersion = flags >> 6
    let originalLength: number
    ;[originalLength, pos] = readBase128(buf, pos)
    // glyf/loca are transformed at version 0; every other table at 1..3.
    const transformed =
      tag === "glyf" || tag === "loca"
        ? transformVersion === 0
        : transformVersion !== 0
    let length = originalLength
    if (transformed) [length, pos] = readBase128(buf, pos)
    tables.push({ tag, length })
  }
  const data = brotliDecompressSync(buf.subarray(pos, pos + compressedLength))
  let offset = 0
  for (const table of tables) {
    if (table.tag === "cmap")
      return data.subarray(offset, offset + table.length)
    offset += table.length
  }
  throw new Error("WOFF2: no cmap table")
}

function cmapFromSfnt(buf: Buffer): Buffer {
  const numTables = buf.readUInt16BE(4)
  for (let i = 0; i < numTables; i++) {
    const record = 12 + i * 16
    if (buf.toString("ascii", record, record + 4) === "cmap") {
      const offset = buf.readUInt32BE(record + 8)
      return buf.subarray(offset, offset + buf.readUInt32BE(record + 12))
    }
  }
  throw new Error("sfnt: no cmap table")
}

export function coveredCodePoints(font: Buffer): Set<number> {
  const cmap =
    font.toString("ascii", 0, 4) === "wOF2"
      ? cmapFromWoff2(font)
      : cmapFromSfnt(font)
  const covered = new Set<number>()
  const subtables = cmap.readUInt16BE(2)
  for (let i = 0; i < subtables; i++) {
    const offset = cmap.readUInt32BE(4 + i * 8 + 4)
    const format = cmap.readUInt16BE(offset)
    if (format === 12) {
      const groups = cmap.readUInt32BE(offset + 12)
      for (let g = 0; g < groups; g++) {
        const at = offset + 16 + g * 12
        const end = cmap.readUInt32BE(at + 4)
        for (let c = cmap.readUInt32BE(at); c <= end; c++) covered.add(c)
      }
    } else if (format === 4) {
      const segmentsX2 = cmap.readUInt16BE(offset + 6)
      const endCodes = offset + 14
      const startCodes = endCodes + segmentsX2 + 2
      const idRangeOffsets = startCodes + segmentsX2 + segmentsX2
      for (let s = 0; s < segmentsX2 / 2; s++) {
        const end = cmap.readUInt16BE(endCodes + s * 2)
        const start = cmap.readUInt16BE(startCodes + s * 2)
        const rangeOffset = cmap.readUInt16BE(idRangeOffsets + s * 2)
        for (let c = start; c <= end && c !== 0xffff; c++) {
          if (rangeOffset === 0) {
            covered.add(c)
          } else {
            const glyphAt =
              idRangeOffsets + s * 2 + rangeOffset + (c - start) * 2
            if (cmap.readUInt16BE(glyphAt) !== 0) covered.add(c)
          }
        }
      }
    }
  }
  return covered
}
