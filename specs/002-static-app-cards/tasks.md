# Tasks: Static Application Cards

**Input**: Design documents from `/specs/002-static-app-cards/`

**Prerequisites**: [plan.md](plan.md) (required), [spec.md](spec.md) (required for user stories), [research.md](research.md), [data-model.md](data-model.md), [contracts/box-markup.md](contracts/box-markup.md), [contracts/admin-checklist.md](contracts/admin-checklist.md), [quickstart.md](quickstart.md)

**Tests**: Not requested. No automated test tasks are generated. Verification is done by the browser and keyboard checks in [quickstart.md](quickstart.md), listed as tasks in the phases below.

**Organization**: Tasks are grouped by user story (spec priorities: US1 = P1, US2 = P2, US3 = P3).

**Dependency note**: Phase 2 blocks every user story. US3 edits the same list and stylesheet as US2, so run US3 after US2 to avoid conflicts. Tasks in the same file are not marked [P].

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: The user story the task serves (US1, US2, US3). Setup, Foundational and Polish tasks have no story label.

---

## Phase 1: Setup (remove the build)

**Purpose**: Remove the generator, the template, the data file and the Node tooling (plan: Project Structure, "Removed by this feature")

- [X] T001 [P] Delete the page template `src/index.template.html`
- [X] T002 [P] Delete the Tailwind source `src/input.css`
- [X] T003 [P] Delete the build script `scripts/build-site.mjs`
- [X] T004 [P] Delete the build tests `tests/build-site.test.mjs`
- [X] T005 [P] Delete the application list `data/apps.json` and its folder `data/` if it is then empty
- [X] T006 [P] Delete `package.json` and `package-lock.json` at the repository root (Node is no longer used)
- [X] T007 [P] Remove the generated-output rules for `site/index.html` and `site/style.css` from `.gitignore`, so both files are committed

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: The page shell and the design tokens that every user story uses. MUST complete before any user story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T008 [P] Rewrite `site/index.html` as the page shell: doctype, `charset`, viewport meta (`width=device-width, initial-scale=1`), one `<link rel="stylesheet" href="style.css">`, no `<script>` element; a `<header>` with the wordmark "Mikrite Nexus" and the theme switch (two radio inputs `#theme-light` and `#theme-dark`, labels "Light" and "Dark", Light checked by default (FR-013)); a `<main>` with `<h1>` "Mikrite Nexus" (the word "Nexus" in a `<span>`), one description paragraph flagged as placeholder text, `<h2>` "Applications", and an `<ul class="apps">` list left empty for now; a `<footer>` with "Copyright © 2026 Mikrite" and "Version 0.0.0" (see FR-012, FR-013)
- [X] T009 [P] Create `site/style.css` with the colour tokens as custom properties on `:root`, using the light and dark values in [001 design.md](../001-mikrite-nexus-front-page/design.md) (the "Title gradient end", "Unavailable chip" and other token rows). Define the light values on `:root`, then the dark values under `@media (prefers-color-scheme: dark)` guarded by `:root:not(:has(#theme-light:checked))`, and again under `:root:has(#theme-dark:checked)`. Give `body` an explicit background and text colour from the tokens
- [X] T010 Style the base layout in `site/style.css`: the page gutter of 16 px, the header, the hero with the title (`clamp(2.5rem, 6vw + 1rem, 4.5rem)`, weight 750, line-height 1.02, letter-spacing -0.035em), the "Nexus" gradient span with a `@supports` plain-text fallback, the description (`clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)`, line-height 1.5, `max-width: 36ch`), and the footer (depends on T009)
- [X] T011 Style the theme switch in `site/style.css` as a segmented control: the two labelled radio inputs are visible, keyboard reachable, with a clear checked state and a visible `:focus-visible` outline (depends on T009)
- [X] T012 Add `@media (prefers-reduced-motion: reduce)` to `site/style.css` so that no transition runs for users who set it (depends on T010)

**Checkpoint**: The page shell renders with the title, description, theme switch and footer, with no boxes.

---

## Phase 3: User Story 1 - Admin edits an application box directly (Priority: P1)

**Goal**: An admin changes boxes by editing `site/index.html` alone, with no build, and the change is visible on reload.

**Independent Test**: Change one box's description in `site/index.html`, save, reload the browser. The new text appears, and no other file changed (spec SC-002).

- [X] T013 [US1] Copy the admin checklist from [contracts/admin-checklist.md](contracts/admin-checklist.md) into `ADMIN.md` at the repository root. It is not served, and it is kept where the admin edits the page (spec FR-008)
- [X] T014 [US1] Add a short "Adding and removing an application" section to `ADMIN.md` that says: copy an existing `<li class="app ...">` box, change its fields as in [contracts/box-markup.md](contracts/box-markup.md), remove a box by deleting its `<li>`, reorder by moving `<li>` elements, and reload. It also says no build is needed (FR-002)
- [X] T015 [US1] Verify the edit cycle by hand: open `site/index.html` in a browser, change a description, reload, confirm the change, then revert it. Record the result in a comment at the top of `ADMIN.md` (quickstart §3, SC-002)

**Checkpoint**: The admin can edit and reload with no build tool installed.

---

## Phase 4: User Story 2 - Visitor sees up to five applications (Priority: P2)

**Goal**: A visitor sees zero to five boxes in a wrapping grid, with name, description and thumbnail, at phone and desktop widths.

**Independent Test**: With five boxes in the HTML, load the page at 375 px and 1280 px. All five are visible, in order, with no horizontal scroll (spec SC-003).

- [X] T016 [US2] Add the three preview boxes (Tasks, Notes, Archive, in that order) to the `<ul class="apps">` list in `site/index.html`, using the preview markup in [contracts/box-markup.md](contracts/box-markup.md). Each box uses `thumbnails/<id>.webp` for its thumbnail and `mockups/<id>.svg` for its mock-up, with the descriptions from [001 spec](../001-mikrite-nexus-front-page/spec.md) Assumptions
- [X] T017 [US2] Style the grid in `site/style.css`: `.apps { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 20rem)); justify-content: start; gap }`, so boxes wrap and a single box does not stretch (research R3, FR-003)
- [X] T018 [US2] Style the box card in `site/style.css`: `.app__card` and `.app__link` with the surface token, border, radius, and thumbnail sizing (`width: 100%; height: auto; aspect-ratio: 16 / 10`), with the name (`.app__name`, 1.125rem, weight 650) and description (`.app__text`, 0.9375rem, line-height 1.5, `-webkit-line-clamp: 3`)
- [X] T018a [US2] Style a neutral placeholder for a missing thumbnail in `site/style.css`: `.app__thumb` falls back to a flat token-coloured block with the same 16:10 aspect ratio, so the card keeps its height and the name and text still show (spec edge case; depends on T018)
- [X] T019 [US2] Style the live hover and focus states in `site/style.css`: `.app--live .app__link:hover` and `:focus-visible` with a translate and a primary border, using `transition` of 180 ms ease-out inside `@media (prefers-reduced-motion: no-preference)`, and a visible `outline` that is never removed (depends on T018)
- [X] T020 [US2] Style the "Live" and "Unavailable" chips and the `.app__chip` base in `site/style.css` (0.75rem, weight 600, uppercase, letter-spacing 0.06em, radius 999px), with the tokens for each status (depends on T018)
- [X] T016a [US2] Add one temporary live box to the list in `site/index.html`, with `href="https://example.org/"` and the live markup from [contracts/box-markup.md](contracts/box-markup.md). Check by hand that it opens in the same tab, that Enter activates it, and that the focus ring shows. Remove it afterwards (FR-006, SC-005)
- [X] T021 [US2] Verify by hand at 375 px and 1280 px, with one box and then five (copy a box temporarily, then remove the copies): every box visible, the grid wraps, no horizontal scroll, and one box does not stretch (quickstart §4, SC-003)

**Checkpoint**: Zero to five boxes render correctly at both widths.

---

## Phase 5: User Story 3 - Preview and empty states (Priority: P3)

**Goal**: Preview boxes show a labelled mock-up, unavailable boxes are shown as disabled, and an empty list shows "No applications yet".

**Independent Test**: With all boxes set to preview, each box shows its mock-up labelled "Preview". With no boxes, "No applications yet" appears in place of the grid (spec SC-004, SC-005).

- [X] T022 [US3] Style the preview mock-up in `site/style.css`: `.app--preview .app__mockup` placed over the thumbnail area, with `width: 100%; height: auto`, and the "Preview" chip shown on the card (depends on T018)
- [X] T023 [US3] Style the disabled state in `site/style.css`: `.app__card[aria-disabled="true"]` with `cursor: default`, no hover highlight, and the unavailable look (muted tokens). The element is focusable (`tabindex="0"`), so it keeps a visible `:focus-visible` outline (depends on T018)
- [X] T024 [US3] Add the empty-state panel markup from [contracts/box-markup.md](contracts/box-markup.md) (`.empty`, `.empty__title` "No applications yet", `.empty__text`) to `ADMIN.md` as a copy-ready snippet, since the admin swaps it in for the list when no boxes remain (FR-005)
- [X] T025 [US3] Style the empty-state panel in `site/style.css`: `.empty` full-width with a dashed border and the tokens for muted text (depends on T018)
- [X] T026 [US3] Verify by hand: all three boxes show "Preview" with their mock-ups. Press Tab from the top of the page until every box has focus. Each live box activates on Enter. Each preview and unavailable box shows its focus ring, is announced as disabled, and does nothing on Enter. With the list replaced by the empty-state panel, "No applications yet" appears (quickstart §4, §5; SC-004, SC-005)

**Checkpoint**: All three states render, and the empty state works.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Deployment config, documentation and final checks that touch more than one story.

- [X] T027 [P] Change the `style.css` rule in `deploy/nginx/nexus.conf` from `public, max-age=31536000, immutable` to `no-cache` (research R4), and update its comment
- [X] T028 [P] Update `README.md`: the tech stack (plain HTML and CSS, no build), the project structure (remove `data/`, `src/`, `scripts/`, `tests/`, `package.json`), the "Running locally" section (open `site/index.html` in a browser; Docker is for pre-release checks), the "Adding an application" section (point to `ADMIN.md`), and the "Application entry contract" section (boxes in HTML, no automatic validation)
- [X] T029 [P] Update `DEPLOYMENT.md`: the release steps that mention the build or `data/apps.json`, and the release check (deferred until the first live box, per spec Clarifications)
- [X] T030 [P] Update `deployment-discussion.md` point 7: `site/index.html` and `site/style.css` are now committed and hand-written; the generated-output rule no longer applies
- [X] T031 Run an HTML validator and a CSS validator by hand on `site/index.html` and `site/style.css`, and fix or justify each warning (constitution Principle I)
- [X] T032 Run [quickstart.md](quickstart.md) §6 to §8: page weight under 100 KB compressed (SC-006), `grep -c "<script" site/index.html` returns `0`, and the footer shows the edit year and version. Then run [admin-checklist.md](contracts/admin-checklist.md) in full

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T001 to T007 touch different files and can run in parallel.
- **Foundational (Phase 2)**: Depends on Setup. T008 and T009 can run in parallel (different files). T010 to T012 depend on T009 and are sequential within `site/style.css`.
- **US1 (Phase 3)**: Depends on Phase 2 (the page shell must exist).
- **US2 (Phase 4)**: Depends on Phase 2. Can run before or after US1; the MVP order below runs US2 first.
- **US3 (Phase 5)**: Depends on US2 (T018), because it edits the same list and stylesheet.
- **Polish (Phase 6)**: Depends on all user stories. T027 to T030 touch different files and can run in parallel.

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2.
- **US2 (P2)**: Independent after Phase 2; it shares `site/index.html` with US1, so do not edit that file in both at once.
- **US3 (P3)**: Depends on US2 for the box styles.

### Parallel Opportunities

- Phase 1: T001 to T007 in parallel.
- Phase 2: T008 and T009 in parallel.
- Phase 6: T027 to T030 in parallel.

## Implementation Strategy

### MVP (recommended)

1. Phase 1 (Setup), then Phase 2 (Foundational).
2. Phase 4 (US2): the page shows the three preview boxes at both widths. This is the first visible result.
3. Phase 3 (US1): the admin checklist and the edit cycle.
4. Stop and check the page with the quickstart before continuing.

### Incremental Delivery

1. Setup and Foundational: the page shell and styles.
2. Add US2: boxes and grid.
3. Add US1: admin workflow and checklist.
4. Add US3: preview, disabled and empty states.
5. Polish: deployment config, documentation, validators, final checks.

## Notes

- Each story is complete when its verification task is ticked off.
- Gaps that analysis should check: `ADMIN.md` is created by T013, but FR-008 requires the checklist to be "kept with the front page", and the choice of `ADMIN.md` at the repository root is a judgement call (T013).
- The link check for live boxes is deferred until the first live box exists (spec Clarifications). No task covers it.
