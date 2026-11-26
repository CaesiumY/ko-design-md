// The site origin as the app uses it: no trailing slash. A value of only slashes
// is therefore empty. The build check and the runtime check both judge this
// result, so neither accepts a value the app would then drop. Neither checks
// that the rest is a valid http(s) origin.
export function normalizeSiteUrl(raw: string): string {
  return raw.replace(/\/+$/, "")
}
