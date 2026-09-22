/**
 * Where the app is mounted.
 *
 * At the root in dev and in the real deployment, but on a repository subpath
 * on GitHub Pages - `/sync-recruiter-portal/`. Vite hands that down as
 * `import.meta.env.BASE_URL`, which always carries a trailing slash; the slash
 * is stripped here so a base of `/` becomes the empty string and every
 * expression below stays a plain concatenation.
 *
 * Every path in the codebase is written root-relative - `/dashboard`, never
 * `dashboard` - and the base is applied at exactly two boundaries: on the way
 * out through `href`, and on the way back in through `toAppPath`. Nothing else
 * has to know the app might not be at the root.
 */
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** An app path as it should appear in the address bar. */
export function href(to: string): string {
  return `${BASE}${to}`
}

/**
 * A file served verbatim out of `public/`.
 *
 * Vite rewrites absolute public paths inside `index.html`, but not inside a
 * JSX string - it cannot tell `"/logo.png"` from any other string literal - so
 * anything referenced from a component has to go through here.
 */
export function asset(file: string): string {
  return `${BASE}/${file}`
}

/** The address bar read back as an app path. */
export function toAppPath(location: string): string {
  return location.startsWith(BASE) ? location.slice(BASE.length) || '/' : location
}
