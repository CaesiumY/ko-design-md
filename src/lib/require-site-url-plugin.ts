import { trimSiteUrl } from "./trim-site-url"
import type { Plugin } from "vite"

// Fails `vite build` when VITE_SITE_URL is missing or holds only spaces and
// slashes.
// `site-config.ts` refuses to run a production bundle without it, but that check
// is bundled into the output: it fires on the first request, after the build has
// already reported success. `scripts/e2e-server.ts` then serves such output as
// fresh.
//
// `config.env` is what Vite inlines into `import.meta.env`, so a value from the
// shell and one from a `.env` file both count.
export function requireSiteUrlPlugin(): Plugin {
  return {
    name: "require-site-url",
    apply: "build",
    configResolved(config) {
      if (trimSiteUrl(config.env.VITE_SITE_URL ?? "")) return
      throw new Error(
        "VITE_SITE_URL must be set for production builds: without it the build output errors on every request. " +
          "Set it in the shell, or for local builds copy .env.example to .env.production.local " +
          "(read by builds only; its placeholder origin is enough to build and test)."
      )
    },
  }
}
