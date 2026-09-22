# Recruiter redesign

The current implementation is a design preview, not complete feature parity. See the [source comparison and known gaps](feature-parity.md).

## Source and scope

Reviewed the recruiter portal in `sync-ngo-sy/sync-hub-v2`, `apps/recruiter-portal`, at commit `fa80ab1a7e63afbf1447cd9de92db9af6622bf94`. Its screen inventory, domain behavior and `CONTEXT.md` informed this implementation. The source repository was not changed.

The standalone design reuses the Material token and primitive foundation of [sync-hub-admin](https://github.com/sam-a1a/sync-hub-admin) and [sync-candidate-portal](https://github.com/sam-a1a/sync-candidate-portal): teal primary roles, tonal surfaces, Google Sans Flex, Noto Sans Arabic, rounded Material Symbols, six color/contrast schemes, shape tokens and spring/motion variables. The recruiter screens and local interaction layer are newly implemented.

## Layout decisions

The recruiter needs to see the next decision without losing the person's context. The dashboard emphasizes the review queue; the application detail pairs the profile with pipeline controls, notes, tags and communications. Screening results and recruiter decisions are deliberately separate visual concepts.

Desktop navigation groups Workspace, People and Tools. It contracts to a rail on medium screens. Phones get four frequent destinations plus a More sheet; wide tables become readable record cards, controls stack, candidate criteria collapse, and selected applications expose a floating shortcut to their actions. Dialog content scrolls independently of its action row. Safe-area spacing protects controls above mobile browser chrome.

Rounded grouped controls, selected-state shape changes, expressive headline typography, tonal containers, icon/label weight transitions and restrained spring motion carry the shared Material identity. Reduced motion disables spatial page/control animation and theme transitions. Keyboard tabs support arrows, Home and End; native modal dialogs provide a focus trap and Escape handling. Focus indicators, a skip link and live feedback are included.

## Workflow behavior

- Job creation separates details, screening and review; unfinished work is recoverable in this browser. Editing an existing draft preserves its lifecycle status.
- Application screening is independent of pipeline stage. Hired and Withdrawn are terminal; a rejected record can reopen only to Reviewing. Recruiters cannot withdraw an application.
- A recorded hire requires a start date and creates an awaiting-confirmation claim. The preview does not imitate candidate confirmation.
- Rejection records a notification date three days later; reopening clears it. No actual notification is scheduled or delivered.
- Bulk selected actions use the intersection of allowed moves. A sweep targets eligible records across the current filtered view. Confirmation states the affected count.
- Talent-pool removal preserves notes and tags. Recently saved sorting uses the saved timestamp.
- Template preview substitutes candidate, job and organization placeholders. Messages are saved locally after confirmation.
- In-use channels cannot be deleted; vocabulary renames propagate to local records.

## Integration boundary

`WorkspaceProvider` is the preview persistence boundary. Production integration needs authenticated, tenant-scoped API adapters; role and capability checks; server-side lifecycle validation; pagination; version/conflict handling; real profile snapshots and CVs; messaging, notifications, invitations, analytics and AI adapters. None of these backend services is shipped or implied by the static Pages site.

All names, profiles, contact addresses, jobs, messages and counts in `src/data.ts` are fictional samples. AI Search uses local keyword scoring, and the assessment panel is a labeled sample. Tracked-link creation demonstrates attribution layout, but link visits do not produce real analytics. CV viewing uses a sample profile and offers an explicitly labeled text-profile download.

## Material research

Research focused on official Material and Android guidance, then adapted the interaction principles to accessible React/HTML controls. The app does not claim to be Google's official web component implementation.

- [Material 3 button groups](https://m3.material.io/components/button-groups/overview)
- [Official Material component button-group behavior](https://github.com/material-components/material-components-android/blob/master/docs/components/ButtonGroup.md)
- [Official split-button guidance](https://github.com/material-components/material-components-android/blob/master/docs/components/SplitButton.md)
- [Official expressive navigation rail guidance](https://github.com/material-components/material-components-android/blob/master/docs/components/NavigationRail.md)
- [Material motion system](https://m3.material.io/styles/motion/overview/how-it-works)
- [Google's Material 3 Expressive introduction](https://blog.google/products-and-platforms/platforms/android/material-3-expressive-android-wearos-launch/)

## Validation

The project includes transition-rule tests and reproducible Playwright browser regression tests. Before deployment, the interface was also checked at 320, 393, 768, 1024 and 1440 CSS-pixel widths, with light/dark themes, reduced motion, keyboard tabs, modal dismissal and direct route loading. Automated accessibility scans supplement manual visual inspection; they do not constitute a full accessibility certification.

Release checks on 22 September 2026: lint and production build passed; all five domain tests and five browser suites passed; 90 route/viewport combinations had no document overflow or runtime errors; 34 axe WCAG A/AA scans across desktop light and phone dark themes reported no violations after fixes.

## Review refinements

Record collections offer persisted card/row presentation. Rows follow the admin Requests page with a shared tonal container, separators and spacious actions. Application and candidate detail tabs keep the screen focused and preserve unsent drafts while switching sections. The job editor uses Tiptap and Markdown like the source portal, with safe read-only rendering. See [Tiptap React setup](https://tiptap.dev/docs/editor/getting-started/install/react) and [Markdown integration](https://tiptap.dev/docs/editor/markdown/getting-started/installation).
