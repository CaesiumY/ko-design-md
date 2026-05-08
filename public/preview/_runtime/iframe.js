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
(function () {
  if (window.parent === window) return;

  function send() {
    var height = document.body.scrollHeight;
    window.parent.postMessage({ type: "preview-height", value: height }, "*");
  }

  if (document.readyState === "complete") {
    send();
  } else {
    window.addEventListener("load", send);
  }

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(send).observe(document.body);
  } else {
    window.addEventListener("resize", send);
  }
})();
