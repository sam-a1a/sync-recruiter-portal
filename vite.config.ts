import { copyFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

/**
 * GitHub Pages serves a project site from `/<repo>/`, not from the root, so
 * the deploy workflow sets BASE_PATH. Left unset - dev, preview, and any real
 * deployment - the app builds for the root as before.
 */
const base = process.env.BASE_PATH ?? '/'

/**
 * Pages is a static file server with no rewrite rules: it looks for a file at
 * the requested path and, finding none, serves `404.html`. The portal's routes
 * are client-side, so `/dashboard` is not a file and a refresh or a shared link
 * would land on the 404 page.
 *
 * Shipping the app itself AS the 404 page makes that miss render the portal.
 * The router reads `location.pathname`, which the browser has left untouched,
 * so the right screen appears with no redirect and no flash of a wrong route.
 * `.nojekyll` is belt and braces: the deploy action does not run Jekyll, but
 * the file costs nothing and stops any future Pages source from eating the
 * build output.
 */
function githubPagesFallback(): Plugin {
  /* Taken from the resolved config rather than assumed: `__dirname` does not
     exist in an ESM config, and outDir is Vite's to decide, not ours. */
  let dist = ''

  return {
    name: 'github-pages-fallback',
    apply: 'build',
    configResolved(config) {
      dist = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
      writeFileSync(resolve(dist, '.nojekyll'), '')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), githubPagesFallback()],
})
