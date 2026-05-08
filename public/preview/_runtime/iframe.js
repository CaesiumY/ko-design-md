/*
 * ko/design.md — preview iframe runtime
 *
 * Reports body height to the parent window so the embedding page can grow the
 * iframe to fit the full preview, avoiding a nested scrollbar. The script only
 * runs when loaded inside an iframe (top window === self skips the work).
 */
(function () {
  if (window.parent === window) return;

  function send() {
    var height = document.body.scrollHeight;
    window.parent.postMessage(
      { type: "preview-height", value: height },
      window.location.origin,
    );
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
