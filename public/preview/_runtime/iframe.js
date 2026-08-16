/*
 * ko/design.md — preview iframe runtime
 *
 * Reports body height to the parent window so the embedding page can grow the
 * iframe to fit the full preview, avoiding a nested scrollbar. The script only
 * runs when loaded inside an iframe (top window === self skips the work).
 *
 * targetOrigin is "*" because this script is meant to work when our preview
 * is embedded under a different origin too (the file is intentionally
 * shareable as a standalone iframe). The payload is just a non-sensitive
 * height number, so broadcasting it is safe. The same-origin parent listener
 * still verifies event.origin matches its own origin before reacting.
 */
/*
 * Theme variants
 * --------------
 * A merged preview holds one document for both themes (issue #235). Most of it
 * is shared, but each theme has prose the other does not — dark explains what
 * dark does, and saying it in light would be wrong. Those passages ship as
 * `<template data-theme-variant="dark">`.
 *
 * `<template>` and not a hidden element: template content is inert. It does not
 * render, does not enter the accessibility tree, is not found by find-in-page,
 * and is not copied with a selection. The document therefore never carries text
 * that is present but invisible — swapping moves nodes in and out of the tree
 * rather than showing and hiding them.
 *
 * Two operations, named by `data-theme-op`:
 *   swap   — replace the preceding node with the template's content. Empty
 *            content means the preceding node is dark-only-absent.
 *   insert — content the light half has no counterpart for; place it here in
 *            dark, take it away in light.
 *
 * With no script at all the file is the light theme, which is what its
 * `<html data-theme="light">` says.
 *
 * The anchor is a comment node, not the <template>
 * -------------------------------------------------
 * `<template>` is inert as CONTENT but it is still an element, so leaving it in
 * the flow puts a node between siblings that a selector expects to be adjacent.
 * baemin's `.section + .section { border-top }` is the case that surfaced it:
 * `insert` places the dark section before the anchor, so in dark the order
 * became [dark section][template][section] and the `+` stopped matching —
 * border-top-color fell back to currentColor. Light was unaffected only by
 * accident, because the element before that anchor happens not to be a
 * `.section`.
 *
 * So `collect()` swaps each <template> for a comment node and keeps the parsed
 * content in memory. A comment is not an element: it breaks no `+`/`~` chain,
 * shifts no `:nth-child` index, and keeps every inertness property the
 * <template> was chosen for.
 *
 * What a `swap` swaps, and what a template holds
 * ----------------------------------------------
 * Both were read too literally at first, and both fail silently.
 *
 * The light node is the previous CONTENT sibling, not `previousSibling`. A
 * hand-written file indents its markup, so a `swap` template's immediate
 * previous sibling is the newline before it; swapping that leaves the light
 * prose on screen and the dark prose forever inside the template. `collect()`
 * itself creates the other case — it leaves a comment anchor where each
 * template stood, so a template that follows another template's anchor would
 * take the anchor as its light node and, again, take nothing away.
 *
 * The dark side is ALL of the template's child nodes, not `content.firstChild`.
 * Same reason: with `<template>` on its own line the first child is whitespace,
 * and a template holding two paragraphs would give up the second.
 *
 * Nodes are moved rather than shown and hidden, so each side is held as an
 * array and the two ops are the same move: take one side out, put the other
 * side back at the anchor. `insert` is just a swap whose light side is empty.
 *
 * The fix lives here rather than in the file format on purpose. The on-disk
 * `<template>` is also the hand-authoring convention
 * (`.claude/agents/preview-html-author.md`) and what `src/lib/preview-halves.ts`
 * reconstructs the two halves from; moving the dark markup into comment data
 * would make authors hand-escape markup that must never contain `-->`, and would
 * hide it from the validator's element walk. Measured: with the runtime blocked
 * entirely — templates left in the flow, which is the only case this does not
 * reach — light still renders exactly like the original light.html on all 17
 * slugs. The trap is latent there, not live.
 */
;(function () {
  var variants = []

  /** Whitespace-only text and comments are formatting, not the swapped node. */
  function contentNode(node) {
    while (
      node !== null &&
      (node.nodeType === 8 ||
        (node.nodeType === 3 && node.data.replace(/\s+/g, "") === ""))
    ) {
      node = node.previousSibling
    }
    return node
  }

  function collect() {
    // Static NodeList in every browser that has <template>, so replacing each
    // node while iterating is safe. (querySelectorAll also does not descend into
    // template content, so a nested variant is left alone — as it always was.)
    var tpls = document.querySelectorAll('template[data-theme-variant="dark"]')
    for (var i = 0; i < tpls.length; i++) {
      var tpl = tpls[i]
      var op =
        tpl.getAttribute("data-theme-op") === "insert" ? "insert" : "swap"
      var copy = document.importNode(tpl.content, true)
      var dark = []
      while (copy.firstChild !== null)
        dark.push(copy.removeChild(copy.firstChild))
      // Read the light node before the template leaves the tree.
      var light = op === "swap" ? contentNode(tpl.previousSibling) : null
      var anchor = document.createComment("theme-dark:" + op)
      tpl.parentNode.replaceChild(anchor, tpl)
      variants.push({
        anchor: anchor,
        light: light === null ? [] : [light],
        dark: dark,
        shown: false,
      })
    }
  }

  function lift(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].parentNode !== null)
        nodes[i].parentNode.removeChild(nodes[i])
    }
  }

  function place(nodes, anchor) {
    for (var i = 0; i < nodes.length; i++) {
      anchor.parentNode.insertBefore(nodes[i], anchor)
    }
  }

  function apply(theme) {
    var dark = theme === "dark"
    for (var i = 0; i < variants.length; i++) {
      var v = variants[i]
      // The initial state is already the light one, so the first light pass is
      // a no-op and nothing is moved onto the anchor that was not there before.
      if (dark === v.shown) continue
      lift(dark ? v.light : v.dark)
      place(dark ? v.dark : v.light, v.anchor)
      v.shown = dark
    }
  }

  function themeNow() {
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light"
  }

  function start() {
    collect()
    apply(themeNow())
    new MutationObserver(function () {
      apply(themeNow())
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start)
  } else {
    start()
  }

  // The embedding page asks for a theme when it cannot reach into this document
  // directly. Only our own origin may ask: this file is meant to be embeddable
  // elsewhere, and a foreign embedder should not be able to drive its state.
  // The outbound height message stays targetOrigin "*" for the same reason it
  // always did — a height is not sensitive — but inbound control is not
  // symmetrical with that.
  window.addEventListener("message", function (e) {
    if (e.origin !== window.location.origin) return
    var d = e.data
    if (d === null || typeof d !== "object") return
    if (d.type !== "preview-theme") return
    if (d.value !== "dark" && d.value !== "light") return
    document.documentElement.setAttribute("data-theme", d.value)
  })

  if (window.parent === window) return

  function send() {
    var height = document.body.scrollHeight
    window.parent.postMessage({ type: "preview-height", value: height }, "*")
  }

  if (document.readyState === "complete") {
    send()
  } else {
    window.addEventListener("load", send)
  }

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(send).observe(document.body)
  } else {
    window.addEventListener("resize", send)
  }
})()
