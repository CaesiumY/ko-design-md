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
