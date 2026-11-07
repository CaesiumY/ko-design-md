# audit-contrast fixtures

## `samsung-one-ui-2ead71d-parent.html`

`public/preview/samsung-one-ui/preview.html` exactly as it stood before commit
`2ead71d` ("fix(samsung-one-ui): 프리뷰 대비·접근성 결함을 고친다"), i.e. still
carrying the contrast defects issue #359 tabulates.

It is committed rather than read out of git history on demand, because **it is
not reachable from this repository's history**: the catalogue merges pull
requests with squash, so `2ead71d` — a commit on PR #291's branch — never became
an ancestor of `main`. `git show 2ead71d^:…` works only in a clone that happens
to still hold the branch's objects, which made `pnpm audit:contrast --self-check`
pass locally and fail everywhere else.

Do not edit it. Its value is that nobody wrote it for this test: the numbers
`scripts/audit-contrast-oracle.ts` checks against come from issue #359 and from
`2ead71d`'s own commit message, and this file is the input they were measured
from.

## `nontext-behind-paint-blockers.html`

A synthetic document, written for the self-check alone (#399). It is the one
exception to the rule above that a fixture's value is that nobody wrote it for
the test, and the two files are kept apart because their authority is not the
same kind:

- the samsung file is a **record**: its expected numbers come from an issue and
  a commit message, written before anyone pointed this audit at it;
- this file is **coverage**: it exists so the collector's walk over the layers
  BEHIND a non-text surface — where a filtered panel's pre-filter colour was
  once judged as the colour on screen — runs under the self-check at all. No
  shipped preview has the shape (a small text-free surface over a `filter` or a
  wide inset `box-shadow`), and the samsung file cannot be edited to gain one.

A synthetic fixture is acceptable only while every expectation on it is derived
from its CSS by hand. The derivations sit next to the anchors in
`scripts/audit-contrast-oracle.ts` (`SYNTHETIC_ANCHORS`). Editing this file
means re-deriving those, never copying the measurer's new output into them —
that would turn the check into a test that the measurer agrees with itself.

## `form-control-text.html`

A second synthetic document under the same rule as the one above (#400). It
covers text that is on screen but that the text pass does not measure — a
placeholder and a typed value, which are not text nodes, and a closed
`<select>`'s chosen option, whose text node has no client rects — which the
collector reads from the control itself. No previous fixture has a form control, and the samsung file
cannot gain one.

Every expectation on it is derived by hand in `FORM_ANCHORS`
(`scripts/audit-contrast-oracle.ts`) from achromatic OKLCH, whose relative
luminance is L³. The same condition holds: edit this file, and re-derive
those; never paste the measurer's new output into them.

## `gradient-backdrop.html`

Another synthetic document under the same rule (#402). It covers text and a
non-text surface over a `background-image`, which the sweep judges by every
colour the image can paint rather than holding outright. No text in the
samsung file sits on a gradient, and the file cannot gain one.

Every expectation on it is derived by hand in `GRADIENT_ANCHORS`
(`scripts/audit-contrast-oracle.ts`): each gradient runs between two
achromatic OKLCH colours, so it is grey in either interpolation space, its
luminance runs monotonically from one end to the other, and the weakest colour
is an end stop with luminance L³. The same condition holds: edit this file,
and re-derive those; never paste the measurer's new output into them.
