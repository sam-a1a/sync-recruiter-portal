# Icon and language sources

- Language names, endonyms and the predefined skill catalogue mirror the candidate portal's `src/features/profile/catalogues.ts`. Legacy recruiter skill names are retained for existing records.
- The 30 language flags come from [HatScripts/circle-flags](https://github.com/HatScripts/circle-flags/tree/gh-pages/flags/language). They are bundled under `public/flags/language`; the MIT license is in `public/flags/circle-flags-LICENSE.txt`.
- Brand marks come from [thesvg.org](https://thesvg.org), using the public [GLINCKER/thesvg registry](https://github.com/GLINCKER/thesvg/blob/main/src/data/icons.json), retrieved September 22, 2026. `public/catalogues/brands.json` is a local searchable subset of the registry fields. It is fetched only when a recruiter adds or edits a channel. Exact brand names, aliases, or website domains resolve a logo; unmatched channels use a link icon.
- Common channel and software logos are bundled in `public/brand-icons`, with individual source paths and licenses in `sources.json`. Other matched logos are loaded from their registry URL on thesvg.org. Failed images fall back to a link icon. SVG files are rendered as images, never injected as markup.
- Non-brand skills (for example, safeguarding and project management) use the existing Material Symbols semantic icons. Brand skills such as Excel and Google Sheets use thesvg.org marks.

Brand marks belong to their respective owners. Registry metadata records the license supplied for each asset.
