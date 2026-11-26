// The one trimming rule for the site origin: no surrounding spaces, no trailing
// slash. A value of only those is empty. The build check, the runtime check in
// `site-config.ts` and `seo-feed.ts` all judge this result, so neither check
// accepts a value that comes out empty later.
//
// It does not check for an http(s) origin: the value stored in the deploy
// environment is not readable from here, so a stricter build check could stop a
// deploy that serves pages today. `seo-feed.ts` adds that check for its own
// output.
export function trimSiteUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "")
}
