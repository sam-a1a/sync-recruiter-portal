# SYNC Hub · Recruiter portal

A Material 3 Expressive design preview of the SYNC Hub recruiter workspace, aligned with the SYNC admin and candidate portals. It is not a one-for-one functional migration of the production portal.

**[Open the interactive preview](https://sam-a1a.github.io/sync-recruiter-portal/)** · [Design and implementation notes](docs/design.md) · [Source feature comparison](docs/feature-parity.md)

The repository is private. Its GitHub Pages preview is publicly accessible and contains fictional sample data only. This is a standalone, interactive frontend: changes persist in the current browser; it does not connect to production authentication, recruitment APIs, email, file storage, tracking, or AI services. No production credentials or candidate data are included.

## Explore

- **Dashboard:** review queue, pipeline, open roles, sourcing overview.
- **Jobs:** search and status filters, details, applications, screening criteria, tracked links, and a three-step creation flow with a recoverable draft.
- **Applications:** screening and pipeline filters, selected actions and filtered sweeps, profile review, notes, tags, messages, sample assessment, rejection and hire flows.
- **Candidates and talent pool:** structured filters, sample AI-search layout, profile details, saved people, team notes and tags.
- **Placements:** confirmed, awaiting confirmation and denied claims.
- **Workspace:** message templates, tracked links, team membership, shared tags/channels, organization and account settings.
- **Public pages:** introduction, sample opportunity, request access, sign-in, password reset and invitation acceptance layouts.

Record collections offer persistent **Cards / Rows** controls. Application and candidate records use URL-linked section tabs. Job descriptions support rich-text formatting, preserved as Markdown through draft, review, publishing and editing.

Use **Settings → Organization → Reset preview** to restore the fictional workspace. Account settings expose light/dark/system appearance and contrast preferences. Motion follows the system's reduced-motion setting.

## Development

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm test
npm run build
```

Browser regression tests run against their own local development server:

```sh
npx playwright install chromium
npm run test:browser
```

Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` if using an existing Chromium installation. Tests cover the job workflow, application transitions, talent-pool notes, templates, workspace settings, keyboard navigation and phone layouts.

## Deployment

Pushing `main` runs lint, domain tests, browser regression tests and a production build, then deploys to GitHub Pages through `.github/workflows/pages.yml`. Pages must use **GitHub Actions** as its source. The workflow derives the Vite base path from the repository name.

To preview the production subpath locally:

```sh
BASE_PATH=/sync-recruiter-portal/ npm run build
BASE_PATH=/sync-recruiter-portal/ npm run preview
```

A generated `404.html` supports refreshing and sharing client-side routes on GitHub Pages. Deep-link responses retain GitHub Pages' HTTP 404 status while rendering the requested screen; in-app navigation does not incur this status. A production application host should rewrite routes to `index.html` with HTTP 200.

## Structure

- `src/features/`: recruiter screens and workflows.
- `src/data.ts`: typed domain models, fictional records and application transition rules.
- `src/store.tsx`: browser-local preview state.
- `src/components/`: shared controls, dialogs, navigation and layout primitives.
- `src/styles/tokens/`, `src/theme/`: shared SYNC Material color, type, motion and theme foundation.
- `src/styles/recruiter.css`: recruiter-specific layouts and responsive behavior.
- `tests/`: domain and browser workflow checks.

The UI copy is English. The inherited font and theme foundation includes Arabic font/direction support, but this redesign does not include a complete Arabic translation. Font license files are retained beside the font assets.
