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
 */
;(function () {
  var variants = []

  function collect() {
    var tpls = document.querySelectorAll('template[data-theme-variant="dark"]')
    for (var i = 0; i < tpls.length; i++) {
      var tpl = tpls[i]
      var op =
        tpl.getAttribute("data-theme-op") === "insert" ? "insert" : "swap"
      var dark = document.importNode(tpl.content, true).firstChild
      variants.push({
        op: op,
        anchor: tpl,
        light: op === "swap" ? tpl.previousSibling : null,
        dark: dark,
        shown: false,
      })
    }
  }

  function apply(theme) {
    var dark = theme === "dark"
    for (var i = 0; i < variants.length; i++) {
      var v = variants[i]
      if (dark === v.shown) continue
      if (v.op === "insert") {
        if (dark) {
          if (v.dark !== null)
            v.anchor.parentNode.insertBefore(v.dark, v.anchor)
        } else if (v.dark !== null && v.dark.parentNode !== null) {
          v.dark.parentNode.removeChild(v.dark)
        }
      } else {
        var from = dark ? v.light : v.dark
        var to = dark ? v.dark : v.light
        if (from !== null && from.parentNode !== null) {
          if (to !== null) from.parentNode.replaceChild(to, from)
          else from.parentNode.removeChild(from)
        } else if (to !== null && to.parentNode === null) {
          // The other side was absent, so there is nothing to replace.
          v.anchor.parentNode.insertBefore(to, v.anchor)
        }
      }
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
