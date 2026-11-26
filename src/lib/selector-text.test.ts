import { describe, expect, it } from "vitest"
import { lightSpellingOf, mentionsDarkScope } from "./selector-text"

describe("mentionsDarkScope", () => {
  it("recognises the scope however it is quoted or spaced", () => {
    for (const selector of [
      '[data-theme="dark"] .btn',
      "[data-theme='dark'] .btn",
      "[data-theme=dark] .btn",
      '[ data-theme = "dark" ] .btn',
      'html[data-theme="dark"] .btn',
      '.note, :root[data-theme="dark"] .btn',
      '[data-theme="dark" i] .btn',
      '[data-theme="dark"s] .btn',
      "[data-theme=dark I] .btn",
      '[DATA-THEME="dark"] .btn',
      '[|data-theme="dark"] .btn',
      '[*|data-theme="dark"] .btn',
    ]) {
      expect(mentionsDarkScope(selector), selector).toBe(true)
    }
  })

  it("does not take the light scope, a class or a longer value for it", () => {
    expect(mentionsDarkScope('[data-theme="light"] .btn')).toBe(false)
    expect(mentionsDarkScope(".dark .btn")).toBe(false)
    expect(mentionsDarkScope('[data-theme="darker"] .btn')).toBe(false)
    expect(mentionsDarkScope("[data-theme=darki] .btn")).toBe(false)
  })
})

// What a dark selector would be in a light sheet. The pairing falls back on
// this, so each line here is a spelling of the scope a copied sheet could hide
// behind.
describe("lightSpellingOf", () => {
  it("takes the scope off a descendant, however the scope is spelled", () => {
    for (const selector of [
      '[data-theme="dark"] .btn',
      "[data-theme='dark'] .btn",
      "[data-theme=dark] .btn",
      'html[data-theme="dark"] .btn',
      ':root[data-theme="dark"] .btn',
      ':where([data-theme="dark"]) .btn',
      'html[data-theme="dark"][data-theme="dark"] .btn',
      '[data-theme="dark" i] .btn',
      ":root[data-theme=dark s] .btn",
      '[|data-theme="dark"] .btn',
      'HTML[data-theme="dark"] .btn',
    ]) {
      expect(lightSpellingOf(selector), selector).toBe(".btn")
    }
  })

  // `unscopeSelector` turns a hand-written `html[data-theme="dark"] .btn` in
  // the dark sheet into `html .btn`, which is what reaches the pairing.
  it("drops a root that only leads to a descendant", () => {
    expect(lightSpellingOf("html .btn")).toBe(".btn")
    expect(lightSpellingOf("HTML .btn")).toBe(".btn")
    expect(lightSpellingOf(":root .btn:hover")).toBe(".btn:hover")
  })

  it("keeps the root where the selector is about the root", () => {
    expect(lightSpellingOf("[data-theme='dark']")).toBe(":root")
    expect(lightSpellingOf('html[data-theme="dark"]')).toBe(":root")
    expect(lightSpellingOf("[data-theme='dark'].panel")).toBe(":root.panel")
    expect(lightSpellingOf("[data-theme='dark'] > body")).toBe(":root > body")
    expect(lightSpellingOf("html > body")).toBe("html > body")
    expect(lightSpellingOf("html")).toBe("html")
  })

  // `html` and `:root` beside the scope, in the same compound, name the element
  // the scope is already on. `unscopeSelector` leaves `:root:root .btn` of the
  // first and `html:root .btn` of the third, and those reach the pairing too.
  it("reads the root named again beside the scope as the root once", () => {
    for (const selector of [
      '[data-theme="dark"]:root .btn',
      "[data-theme='dark']:root .btn",
      'html[data-theme="dark"]:root .btn',
      ':root[data-theme="dark"]:root .btn',
      'html:root[data-theme="dark"] .btn',
      ':root:root[data-theme="dark"] .btn',
      '[data-theme="dark"]:root[data-theme="dark"] .btn',
      '[data-theme="dark"]:ROOT .btn',
      ':root:where([data-theme="dark"]) .btn',
      'html:where([data-theme="dark"]) .btn',
      ':where([data-theme="dark"]):root .btn',
      ":root:root .btn",
      "html:root .btn",
      "html:root:root .btn",
    ]) {
      expect(lightSpellingOf(selector), selector).toBe(".btn")
    }
    for (const selector of [
      '[data-theme="dark"]:root',
      'html[data-theme="dark"]:root',
      ":root:root",
      "html:root",
    ]) {
      expect(lightSpellingOf(selector), selector).toBe(":root")
    }
    expect(lightSpellingOf('[data-theme="dark"]:root.panel .x')).toBe(
      ":root.panel .x"
    )
    expect(lightSpellingOf(":root:root > body")).toBe(":root > body")
  })

  // Anything else in that compound is a condition on the root, and is kept: it
  // is another selector than the bare one, even where it happens to name the
  // root (`:is(html)`). Such a rule pairs with a light rule spelled the same.
  it("keeps any other compound on the root as it is written", () => {
    expect(lightSpellingOf('[data-theme="dark"].panel .btn')).toBe(
      ":root.panel .btn"
    )
    expect(lightSpellingOf('[data-theme="dark"]:not(.x) .btn')).toBe(
      ":root:not(.x) .btn"
    )
    expect(lightSpellingOf('[data-theme="dark"]:is(html) .btn')).toBe(
      ":root:is(html) .btn"
    )
    expect(lightSpellingOf('[data-theme="dark"]:where(:root) .btn')).toBe(
      ":root:where(:root) .btn"
    )
    expect(lightSpellingOf(":root-ish .btn")).toBe(":root-ish .btn")
  })

  it("reads each selector of a list on its own", () => {
    expect(lightSpellingOf("[data-theme='dark'] .a, .b, html .c")).toBe(
      ".a, .b, .c"
    )
  })

  // The attribute on another element is another rule, not a spelling of the
  // scope: stripping it would invent a selector no sheet holds.
  it("leaves the attribute alone where it is not on the root", () => {
    expect(lightSpellingOf('body[data-theme="dark"] .x')).toBe(
      'body[data-theme="dark"] .x'
    )
    expect(lightSpellingOf('.x [data-theme="dark"] .y')).toBe(
      '.x [data-theme="dark"] .y'
    )
  })
})
