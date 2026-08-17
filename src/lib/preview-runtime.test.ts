import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom"
import { describe, expect, it } from "vitest"

// The shipped runtime, executed rather than read. `preview-halves.ts` performs
// the same two moves for the build-time gates, and the pair only stays honest
// if both are exercised — the merged layout's whole promise is that the file a
// browser runs and the file the validator reconstructs say the same thing.
const RUNTIME = readFileSync(
  fileURLToPath(
    new URL("../../public/preview/_runtime/iframe.js", import.meta.url)
  ),
  "utf8"
)

function open(body: string): {
  doc: JSDOM["window"]["document"]
  theme: (t: string) => void
} {
  const dom = new JSDOM(
    `<!doctype html><html data-theme="light"><head><script>${RUNTIME}</script></head>` +
      `<body>${body}</body></html>`,
    { runScripts: "dangerously" }
  )
  const doc = dom.window.document
  return {
    doc,
    theme: (t: string) => {
      doc.documentElement.setAttribute("data-theme", t)
    },
  }
}

// The runtime reacts through a MutationObserver, whose callback is a microtask;
// reading the DOM in the same turn would be reading it before the swap.
const text = (doc: JSDOM["window"]["document"]) =>
  doc.body.textContent.replace(/\s+/g, " ").trim()

async function settle(): Promise<void> {
  await new Promise((r) => setTimeout(r, 0))
}

describe("the preview iframe runtime", () => {
  // A <template> is inert as content but is still an element, so leaving one in
  // the flow breaks a `+`/`~` chain and shifts `:nth-child` — baemin's
  // `.section + .section { border-top }` is the case that surfaced it.
  it("leaves no <template> in the sibling chain", async () => {
    const { doc } = open(
      `<p>라이트</p><template data-theme-variant="dark" data-theme-op="swap"><p>다크</p></template>`
    )
    await settle()
    expect(doc.querySelectorAll("template").length).toBe(0)
  })

  // Both themes' prose rendering at once is what an anchor shared by a swap and
  // an insert used to produce.
  it("shows one theme's prose at a time when ops share an anchor", async () => {
    const { doc, theme } = open(
      `<p>라이트</p>` +
        `<template data-theme-variant="dark" data-theme-op="swap"><p>다크</p></template>` +
        `<template data-theme-variant="dark" data-theme-op="insert"><section>다크 전용</section></template>` +
        `<div>공유</div>`
    )
    expect(text(doc)).toBe("라이트공유")

    theme("dark")
    await settle()
    expect(text(doc)).toBe("다크다크 전용공유")

    theme("light")
    await settle()
    expect(text(doc)).toBe("라이트공유")
  })

  it("survives indentation around and inside a template", async () => {
    const { doc, theme } = open(`
  <p>라이트</p>
  <template data-theme-variant="dark" data-theme-op="swap">
    <p>다크</p>
  </template>
  <div>공유</div>
`)
    expect(text(doc)).toBe("라이트 공유")

    theme("dark")
    await settle()
    expect(text(doc)).toBe("다크 공유")
  })

  it("moves every node a template holds", async () => {
    const { doc, theme } = open(
      `<div>공유</div>` +
        `<template data-theme-variant="dark" data-theme-op="insert"><p>하나</p><p>둘</p></template>`
    )
    theme("dark")
    await settle()
    expect(text(doc)).toBe("공유하나둘")
  })

  // Swapping is a move, not a hide: the theme that is not showing must not be
  // in the document at all, or find-in-page and a selection copy would pick it
  // up. That property is the reason the format uses <template> in the first
  // place, and it has to survive the swap too.
  it("keeps the hidden theme out of the document", async () => {
    const { doc, theme } = open(
      `<p>라이트</p><template data-theme-variant="dark" data-theme-op="swap"><p>다크</p></template>`
    )
    expect(text(doc)).not.toContain("다크")

    theme("dark")
    await settle()
    expect(text(doc)).not.toContain("라이트")
  })

  it("is idempotent across a theme cycle", async () => {
    const markup =
      `<p>라이트</p>` +
      `<template data-theme-variant="dark" data-theme-op="swap"><p>다크</p></template>` +
      `<template data-theme-variant="dark" data-theme-op="insert"><section>다크 전용</section></template>` +
      `<div>공유</div>`
    const once = open(markup)
    once.theme("dark")
    await settle()

    const cycled = open(markup)
    for (const t of ["dark", "light", "dark", "light", "dark"]) {
      cycled.theme(t)
      await settle()
    }
    expect(cycled.doc.body.innerHTML).toBe(once.doc.body.innerHTML)
  })
})
