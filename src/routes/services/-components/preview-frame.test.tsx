// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { PreviewFrame } from "./preview-frame"

// jsdom does not fetch an iframe's `src`, so `contentDocument` is a document
// with a null `documentElement` — the exact shape the component skips over.
// Standing in a real (detached) <html>/<body> pair per element is what makes
// "did the component write the theme onto THIS iframe's document" observable
// at all; nothing else the component does distinguishes the two effects.
const stubs = new WeakMap<
  HTMLIFrameElement,
  { documentElement: HTMLElement; body: HTMLElement }
>()
let originalContentDocument: PropertyDescriptor | undefined

beforeEach(() => {
  originalContentDocument = Object.getOwnPropertyDescriptor(
    HTMLIFrameElement.prototype,
    "contentDocument"
  )
  Object.defineProperty(HTMLIFrameElement.prototype, "contentDocument", {
    configurable: true,
    get(this: HTMLIFrameElement) {
      let stub = stubs.get(this)
      if (stub === undefined) {
        stub = {
          documentElement: document.createElement("html"),
          body: document.createElement("body"),
        }
        stubs.set(this, stub)
      }
      return stub
    },
  })
})

afterEach(() => {
  if (originalContentDocument !== undefined) {
    Object.defineProperty(
      HTMLIFrameElement.prototype,
      "contentDocument",
      originalContentDocument
    )
  }
  cleanup()
})

const frameTheme = (container: HTMLElement): string | null => {
  const iframe = container.querySelector("iframe")
  if (iframe === null) return null
  const doc = iframe.contentDocument
  // The stub above always supplies one; the DOM type says it may not.
  if (doc?.documentElement == null) return null
  return doc.documentElement.getAttribute("data-theme")
}

describe("PreviewFrame", () => {
  it("writes the theme onto the loaded document", () => {
    const { container } = render(<PreviewFrame slug="toss" theme="dark" />)
    expect(frameTheme(container)).toBe("dark")
  })

  // The iframe is keyed by slug, so a slug change replaces the element and the
  // new document starts at the file's own `data-theme="light"`. The theme
  // effect has to run again — with `[theme]` alone it does not, and the next
  // preview opens light while the toggle still reads dark.
  it("writes the theme again when the slug changes", () => {
    const { container, rerender } = render(
      <PreviewFrame slug="toss" theme="dark" />
    )
    expect(frameTheme(container)).toBe("dark")

    rerender(<PreviewFrame slug="baemin" theme="dark" />)
    expect(frameTheme(container)).toBe("dark")
  })
})
