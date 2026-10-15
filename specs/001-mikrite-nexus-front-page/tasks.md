# Tasks: Mikrite Nexus Front Page

**Input**: Design documents from `/specs/001-mikrite-nexus-front-page/`

**Prerequisites**: [plan.md](plan.md) (required), [spec.md](spec.md) (required), [research.md](research.md), [data-model.md](data-model.md), [contracts/app-entry.md](contracts/app-entry.md), [design.md](design.md), [quickstart.md](quickstart.md)

**Tests**: Included. [plan.md](plan.md) (Testing) requires `node --test` for the build's pure functions, and [quickstart.md](quickstart.md) step 1 runs `tests/build-site.test.mjs`.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1, US2, US3)
- Every task names the exact file it touches

## Environment Prerequisites

The build toolchain needs Node.js, which is not installed on the development PC by default. Before T001:

- Install Node.js 20 or later (LTS) from nodejs.org. The installer includes npm.
- Verify with `node -v` and `npm -v` in a new terminal.
- Docker is not required. It is only an optional way to match production nginx locally ([quickstart.md](quickstart.md) §2). Any static server can serve `site/`.
- Node is needed only for build-time work: Tailwind, the generator and the tests. The served `site/` output needs no Node.

If Node is not available, T001 to T013 and T035 cannot run. Stop and ask rather than skipping them.

## Path Conventions

Static site with a build step (see [plan.md](plan.md) Project Structure):

- `data/apps.json`: application entries (source of truth)
- `src/input.css`, `src/index.template.html`: styling and page shell
- `scripts/build-site.mjs`: validation, card generation, page assembly (Node standard library only)
- `tests/build-site.test.mjs`: `node --test` suite
- `site/`: the only served folder (`index.html`, `style.css`, `mockups/`, `thumbnails/`), all committed

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Toolchain and project skeleton

- [ ] T001 Create `package.json` at the repository root with `"version": "0.0.0"`, `"private": true`, and exact (unranged) devDependencies `tailwindcss` 4.x, `@tailwindcss/cli` 4.x and `daisyui` 5.x. No runtime dependencies. Scripts are added in T012.
- [ ] T002 Confirm `node -v` and `npm -v` work (see Environment Prerequisites), then run `npm install` at the repository root and commit the resulting `package-lock.json`
- [ ] T003 [P] Create `.gitignore` at the repository root with `node_modules/` (only if no `.gitignore` exists yet)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data, template, and the build pipeline core that every user story depends on

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create `src/input.css`: `@import "tailwindcss";`, `@plugin "daisyui"` with two custom themes, `nexus-light` (default) and `nexus-dark` (`prefersdark: true`), using the token values from the colour table in [design.md](design.md) (`base-100`, `base-200`, `base-300`, `base-content`, muted text, `primary`, `secondary`, `warning`, `neutral`, all in `oklch()`). Stock daisyUI themes must not be enabled. Add `@theme` tokens `--space-1` to `--space-9` (0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6 rem), `--shadow-card` (subtle in light, none in dark), the system font stack from [design.md](design.md), and a max content width of 72rem.
- [ ] T005 [P] Create `src/index.template.html`: doctype, `charset`, viewport meta (`width=device-width, initial-scale=1`), one `<link>` to `style.css`, and no `<script>` element. Include a `<header>` with an inline SVG node mark and the wordmark "Mikrite Nexus"; a `<main>` with `<h1>` "Mikrite Nexus" (the word "Nexus" wrapped in a `<span>`), one description paragraph, and `<h2>` "Applications"; and the markers `<!-- APPLICATIONS -->` and `<!-- FOOTER -->`. The description text is a placeholder, flagged for the owner to replace.
- [ ] T006 [P] Create `data/apps.json` with three entries in this order, all `"status": "preview"`: `tasks` (name "Tasks", description "Plan, track and finish the work you have in hand.", mockup `tasks.svg`, thumbnail `tasks.webp`), `notes` (name "Notes", description "Quick capture for ideas that are not ready to become tasks.", mockup `notes.svg`, thumbnail `notes.webp`), `archive` (name "Archive", description "Store finished and reference material so it stays easy to find.", mockup `archive.svg`, thumbnail `archive.webp`). The build fails until the assets from T023 to T028 exist.
- [ ] T007 Create `scripts/build-site.mjs` with exported pure function `validateEntry(entry)` returning `{ valid, errors }`. Enforce the rules from [contracts/app-entry.md](contracts/app-entry.md) field rules, quoted verbatim:
  - `id`: "Matches `^[a-z][a-z0-9-]{1,39}$`. Unique across the array."
  - `name`: "Trimmed length 1-40."
  - `description`: "Trimmed length 1-160."
  - `status`: "One of `live`, `preview`, `unavailable`."
  - `href`: "Only for `live`. Absolute `https://` URL, or a root-relative path beginning with `/`. Never `javascript:` or `data:`." An empty `href` is invalid.
  - `mockup`: "Required for `preview`; optional for `unavailable`; not used for `live`. A file name in `site/mockups/`, matching `^[a-z0-9][a-z0-9.-]*\.svg$`."
  - `thumbnail`: "Required for every status. A file name in `site/thumbnails/`, matching `^[a-z0-9][a-z0-9.-]*\.webp$`."
  - `mockupAlt`: optional string.
  - Fields not listed are ignored and are not an error. Also export `validateEntries(list)`, which checks that the list is an array and that ids are unique.
- [ ] T008 Implement `readApps(path)` in `scripts/build-site.mjs`: parse `data/apps.json`, and throw an error that names the entry `id` and the broken field for each invalid entry ([data-model.md](data-model.md) Validation). Invalid entries are never skipped silently. An empty array `[]` is valid.
- [ ] T009 Implement `buildPage(template, apps, options)` in `scripts/build-site.mjs`: replace `<!-- APPLICATIONS -->` with the grid container and replace `<!-- FOOTER -->` with the footer. The grid's card content is added in US2 and US3. HTML-escape all text inserted from entries.
- [ ] T010 Implement `renderFooter({ year, version })` in `scripts/build-site.mjs`: output `<footer>` with "Copyright © {year} Mikrite" and "v{version}" (FR-012, FR-013). Take the year from the build date and the version from `package.json`. Local builds show `0.0.0`.
- [ ] T011 Implement the file-existence check in `scripts/build-site.mjs`: every `mockup` must exist in `site/mockups/` and every `thumbnail` must exist in `site/thumbnails/`. A missing file fails the build with an error naming the entry `id` and the file name ([data-model.md](data-model.md) Storage).
- [ ] T012 Add scripts to `package.json`. `build`: `tailwindcss -i ./src/input.css -o ./site/style.css --minify && node scripts/build-site.mjs`. `dev`: the same Tailwind command with `--watch`, run alongside the generator in watch mode ([research.md](research.md) §9).
- [ ] T013 Create `tests/build-site.test.mjs` with `node:test` and `node:assert`. Cover `validateEntry` for each field rule in T007, using one accepted and one rejected example per rule. Cover that `readApps` throws with the entry id and field name for an invalid entry.

**Checkpoint**: Validation, the build core, and the footer work. User story implementation can begin.

---

## Phase 3: User Story 1 - Understand what Mikrite Nexus is (Priority: P1) 🎯 MVP

**Goal**: The title, a short description, the footer and the empty state render with no applications configured.

**Independent Test**: Set `data/apps.json` to `[]`, run `npm run build`, and open `site/index.html`. The title "Mikrite Nexus" and the description are visible above the fold at 1280×720 and 375×667. The text "No applications yet" appears in place of the grid.

### Implementation for User Story 1

- [ ] T014 [US1] Style the title, description and hero in `src/input.css` and `src/index.template.html`. Title: `clamp(2.5rem, 6vw + 1rem, 4.5rem)`, weight 750, line-height 1.02, letter-spacing `-0.035em`. The "Nexus" span uses a `linear-gradient` from `--color-text` to the `secondary` token with `background-clip: text`, under `@supports` with a plain-text fallback. Description: `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)`, line-height 1.5, muted text, `max-width: 36ch`.
- [ ] T015 [US1] Add the hero's background in `src/input.css`: a dot grid made with `radial-gradient` in `background-image`, faded out by a radial `mask-image`. Use no image file and no request.
- [ ] T016 [US1] Set the page gutters in `src/input.css`: 1rem on phones (required by FR-009), 2rem from 768px, 3rem from 1200px. Use the `--space-*` tokens and a max content width of 72rem, centred.
- [ ] T017 [US1] Implement `renderEmptyState()` in `scripts/build-site.mjs`: when `apps` is empty, output a full-width dashed-border panel with the heading text "No applications yet" and one line of explanation, in place of the grid. Add the panel style to `src/input.css`.
- [ ] T018 [US1] Add tests in `tests/build-site.test.mjs`: an empty array produces the "No applications yet" panel and no `<ul>` of cards; the built HTML contains `<h1>` with "Mikrite Nexus" and a description paragraph; the output contains no `<script>` element.

**Checkpoint**: User Story 1 works alone. The title, description, footer and empty state render.

---

## Phase 4: User Story 2 - Choose an application from the boxes (Priority: P2)

**Goal**: Each live entry renders as a keyboard-reachable link box, in a responsive grid.

**Independent Test**: Temporarily set one entry to `"status": "live"` with an `href` (for example `/tasks/`), build, and check that one box shows the name, description and "Live" chip, and that activating it navigates to the `href`.

### Implementation for User Story 2

- [ ] T019 [US2] Implement `renderCard(entry)` for `status: "live"` in `scripts/build-site.mjs`: output an `<li>` containing an `<a href="{href}">` with `aria-labelledby` pointing to the name. Inside the link, output `<img src="thumbnails/{thumbnail}" width="1280" height="800" alt="" loading="lazy">`, a "Live" chip, `<h3>` with the name, a `<p>` with the description, and the footer label "Open".
- [ ] T020 [US2] Implement `renderGrid(apps)` in `scripts/build-site.mjs`: output a `<ul>` with one `<li>` per entry, in array order, by calling `renderCard`. Insert it at `<!-- APPLICATIONS -->` through `buildPage` (T009).
- [ ] T021 [US2] Style the grid in `src/input.css`: `display: grid`, `grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr))`, `gap: var(--space-4)`. Cards get a 1rem radius, a `base-300` border, and `--shadow-card` in light only. Each card has a thin top accent line in `primary` that widens on hover and focus.
- [ ] T022 [US2] Style the card's states in `src/input.css`. Live hover: `-translate-y-0.5` and a `primary` border over 180 ms ease-out, inside `motion-safe:` variants. Focus: `focus-visible:outline-2`, `focus-visible:outline-offset-3`, `focus-visible:outline-primary`, never removed. Chips: 0.75rem, weight 600, uppercase, letter-spacing 0.06em, radius 999px. Card title 1.125rem weight 650. Description 0.9375rem, line-height 1.5, clamped to 3 lines with `-webkit-line-clamp`.
- [ ] T023 [US2] Add tests in `tests/build-site.test.mjs`: a live entry renders one `<a>` whose `href` matches the entry and whose accessible name is the app name; a live entry with no `href` fails `validateEntry`; the grid preserves array order.

**Checkpoint**: User Stories 1 and 2 work. Live boxes are links.

---

## Phase 5: User Story 3 - Preview applications that are not built yet (Priority: P3)

**Goal**: Preview and unavailable entries render as labelled, focusable, non-activatable boxes with their mock-ups and thumbnails.

**Independent Test**: With the three preview entries from T006, every box shows its thumbnail and the "Preview" chip, and each mock-up opens from `site/mockups/`. Tab reaches every box and announces it as disabled. Enter does nothing.

### Assets for User Story 3

- [ ] T024 [P] [US3] Create `site/mockups/tasks.svg`: a hand-authored SVG with `viewBox="0 0 1600 1000"`, a simplified wireframe of the Tasks main screen, a "Preview" watermark in one corner, `currentColor` plus a few fixed hues, no raster images and no fonts, under 4 KB.
- [ ] T025 [P] [US3] Create `site/mockups/notes.svg` with the same constraints as T024, showing the Notes main screen.
- [ ] T026 [P] [US3] Create `site/mockups/archive.svg` with the same constraints as T024, showing the Archive main screen.
- [ ] T027 [P] [US3] Create `site/thumbnails/tasks.webp`: a 1280×800 WebP rendered from `site/mockups/tasks.svg`. No screenshot of an unbuilt application may be used (spec Assumptions). If no rasteriser is available, stop and ask the owner to supply the file.
- [ ] T028 [P] [US3] Create `site/thumbnails/notes.webp` as in T027, rendered from `site/mockups/notes.svg`.
- [ ] T029 [P] [US3] Create `site/thumbnails/archive.webp` as in T027, rendered from `site/mockups/archive.svg`.

### Implementation for User Story 3

- [ ] T030 [US3] Extend `renderCard(entry)` in `scripts/build-site.mjs` for `status: "preview"`: output an `<li>` containing `<div id="app-{id}" tabindex="0" aria-disabled="true" aria-describedby="app-{id}-status">` with no `href` and no link role. Inside it, output the thumbnail `<img>` (`alt=""`, `width="1280" height="800"`, `loading="lazy"`), a "Preview" chip, `<h3>` with the name, a `<p>` with the description, the footer label "Coming soon", and `<span id="app-{id}-status" class="sr-only">Preview, coming soon. Not available to open.</span>`.
- [ ] T031 [US3] Extend `renderCard(entry)` in `scripts/build-site.mjs` for `status: "unavailable"`: the same non-activatable markup as T030, with the "Unavailable" chip and footer label, and the status text "Unavailable. Not available to open." Show the thumbnail. If the entry has no `mockup`, replace the image with a neutral 16:10 placeholder that carries the text "Preview not available" (spec Edge Cases).
- [ ] T032 [US3] Style preview and unavailable cards in `src/input.css`. Preview: slightly dimmed image and a muted spoke line. Unavailable: muted border and no hover lift. Both keep the visible focus ring. Both have `cursor: default`. The `sr-only` class is in `@layer utilities`.
- [ ] T033 [US3] Add tests in `tests/build-site.test.mjs`: a preview entry renders no `<a>`, has `tabindex="0"` and `aria-disabled="true"`, and points `aria-describedby` at a status element that exists; an unavailable entry with no `mockup` renders the "Preview not available" placeholder; a missing mock-up or thumbnail file fails the build and names the entry `id` (T011).

**Checkpoint**: All three user stories work independently. Stakeholders can review every mock-up on the page.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, verification against the quickstart, and release readiness

- [ ] T034 Add an "Application entry contract" section to `README.md`. Copy the field rules from [contracts/app-entry.md](contracts/app-entry.md), and add the `npm run build`, `npm run dev` and `node --test tests/build-site.test.mjs` commands (constitution Principle III).
- [ ] T035 [P] Run `npm run build` and `node --test tests/build-site.test.mjs`. Confirm that `site/index.html` and `site/style.css` are regenerated, that all tests pass, and that the build fails on a deliberately broken entry, then restore it ([quickstart.md](quickstart.md) §1).
- [ ] T036 Check the layout at 375 px and 1280 px in light and dark. Confirm a 16 px gutter, no horizontal scrollbar, and that the title and description are visible at 375×667 and 1280×720 ([quickstart.md](quickstart.md) §5, SC-002).
- [ ] T037 [P] Check keyboard and accessibility: Tab order, visible focus ring in both schemes, Enter on a live card, no action on preview cards, a Lighthouse accessibility audit, and 4.5:1 contrast for the muted text on both surfaces. If the muted token fails, darken its light value by 2–3 lightness points without changing the hue ([quickstart.md](quickstart.md) §6, [design.md](design.md)).
- [ ] T038 [P] Check the performance budget: exactly one stylesheet and no script; under 100 KB before images, measured compressed; each mock-up SVG under 4 KB; no third-party requests ([quickstart.md](quickstart.md) §7, SC-006).
- [ ] T039 Check scale and empty state. Temporarily set `data/apps.json` to 50 entries (reusing existing thumbnails and mock-ups), build, and confirm the grid wraps with no horizontal scroll. Then set it to `[]`, build, and confirm "No applications yet". Restore the original file ([quickstart.md](quickstart.md) §3 and §5, SC-005).
- [ ] T040 Final review: confirm `data/apps.json` is restored to the three preview entries, that generated files are current, that the footer shows the build year and `v0.0.0`, and that the page contains no `<script>` and no third-party URL.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. Blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational.
- **User Story 2 (Phase 4)**: Depends on Foundational. Uses the page shell from US1 (T014–T016) for visual checks.
- **User Story 3 (Phase 5)**: Depends on Foundational. The assets (T024–T029) can start as soon as Setup is done.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational.
- **US2 (P2)**: Independent after Foundational. Shares `renderCard` with US3, so run US2 before US3 on `scripts/build-site.mjs`.
- **US3 (P3)**: Independent after Foundational. T030 and T031 extend `renderCard` from US2, so start them after T019.

### Within Each Story

- Tests are written alongside the implementation they cover.
- Assets (T024–T029) before the build check (T011) passes on `data/apps.json`.
- Card rendering before card styling.

### Parallel Opportunities

- Setup: T003 alongside T001–T002 once `package.json` exists.
- Foundational: T005 and T006 in parallel (different files).
- Assets: T024, T025, T026, T027, T028 and T029 are all different files and can run in parallel.
- Polish: T035, T037 and T038 in parallel once the build is green.

---

## Parallel Example: User Story 3 assets

```text
# Launch together (different files, no dependencies):
Task: "Create site/mockups/tasks.svg (T024)"
Task: "Create site/mockups/notes.svg (T025)"
Task: "Create site/mockups/archive.svg (T026)"
```

Then, once the SVGs exist:

```text
Task: "Create site/thumbnails/tasks.webp (T027)"
Task: "Create site/thumbnails/notes.webp (T028)"
Task: "Create site/thumbnails/archive.webp (T029)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: title, description, footer and empty state, at both widths
5. Review the shell with the owner if needed

### Incremental Delivery

1. Setup + Foundational → build passes with `[]`
2. Add US1 → title and description reviewable (MVP)
3. Add US2 → live link boxes work (proof path for future live entries)
4. Add US3 → the three previews and their mock-ups are reviewable locally (first delivery)
5. Polish → quickstart verification, README contract, release version 1.0.0 (not in this feature; the local build stays `0.0.0`)

---

## Notes

- [P] tasks touch different files and have no dependencies on incomplete tasks.
- [US] labels map each task to a user story for traceability.
- Generated files `site/index.html` and `site/style.css` are committed, as [research.md](research.md) §2 decides.
- Link checks are not part of this feature. Entries are previews until a real application exists ([spec.md](spec.md) Clarifications).
- Open items, flagged rather than resolved here:
  - The description text in T005 is a placeholder for the owner to replace.
  - [spec.md](spec.md) FR-006 says a preview box shows its mock-up, but the 2026-10-15 clarification says every card shows its own thumbnail. T030 follows the clarification; the mock-up SVG stays reviewable at `site/mockups/`.
  - [contracts/app-entry.md](contracts/app-entry.md) requires a `thumbnail` for every status, so the neutral placeholder in T031 applies only when an unavailable entry has no `mockup`.
