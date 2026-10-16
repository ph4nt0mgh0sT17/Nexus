# Implementation Plan: Static Application Cards

**Branch**: `002-static-app-cards` | **Date**: 2026-10-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-static-app-cards/spec.md`, the superseded design in [001 plan](../001-mikrite-nexus-front-page/plan.md), and the owner's direction for this plan: drop Tailwind, drop `data/apps.json`, make the page fully static, keep the rest of the stack.

## Summary

The front page becomes one hand-written HTML file and one hand-written CSS file, both committed and served as they are. The application boxes are written directly in `site/index.html`, for zero to five applications. An admin edits that file and reloads; no build runs. Tailwind, daisyUI, the Node build script, the template, the generated output and `data/apps.json` are removed. The served page ships no JavaScript, as before, and nginx serves it as static files.

The stack otherwise stays as decided in 001: HTML5 and CSS3, no client JavaScript, nginx in production, Docker `nginx:alpine` for local testing, and the same visual system (light and dark themes, theme switch, fluid type, auto-fill grid).

## Technical Context

**Language/Version**: HTML5 and CSS3. No JavaScript, no Node.js.

**Primary Dependencies**: None. No build tool, no framework, no runtime dependency.

**Storage**: None. Application boxes are HTML in `site/index.html`. Mock-ups (`site/mockups/*.svg`) and thumbnails (`site/thumbnails/*.webp`) are static files committed with the site.

**Testing**: No automated test suite. Verification is the browser and keyboard checks, the admin checklist and the size check in [quickstart.md](quickstart.md). Constitution Principle II's "automated tests for data transforms" no longer applies, because no transform exists.

**Target Platform**: Static files served by nginx (Debian 13 VPS in production; `nginx:alpine` in Docker locally). Browsers: current and previous major of Chrome, Edge, Firefox and Safari.

**Project Type**: Static web site (single page). No build.

**Performance Goals**: One stylesheet, zero scripts, under 100 KB transferred before images, compressed (spec SC-006).

**Constraints**:
- No client-side JavaScript (FR-009). No CSS framework (Clarifications, FR-012).
- No third-party requests, no web fonts, no analytics.
- Phone width 375 px with a 16 px gutter; no horizontal scroll at zero to five boxes (FR-003).
- Keyboard operable; WCAG 2.2 AA contrast and visible focus.
- Light and dark themes: follow `prefers-color-scheme` by default; a theme switch with two choices, no JavaScript, not remembered between visits (001 FR-014, FR-015).
- Respects `prefers-reduced-motion`.

**Scale/Scope**: Zero to five application boxes (spec FR-003). The first delivery lists three previews (Tasks, Notes, Archive).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

Constitution version 3.0.0 (amended 2026-10-16: Tailwind and daisyUI dropped in 2.0.0; Principle IV and the application-box rule redefined in 3.0.0).

| Principle | Status | How the plan meets it |
|---|---|---|
| I. Code Quality | Pass | Two hand-written files with purpose-named classes. No generator, no dead code. HTML and CSS validators are run by hand in quickstart. |
| II. Testing | Pass with a manual check | Browser checks at 375 px and 1280 px, light and dark, keyboard and contrast, per quickstart. No data transform exists, so no automated transform test applies. Link checks are deferred (spec Clarifications), so no live link is checked yet. |
| III. Maintainability | Pass | Markup in `site/index.html`, styling in `site/style.css`, colours and spacing as CSS custom properties. No `data/` folder, no `js/` folder. |
| IV. Scalability | Pass | Application boxes are static HTML in the served page. Adding or removing a box needs no layout or styling change. The grid wraps for up to five boxes, and a single box does not stretch (research R3). The design targets five applications, as redefined in 3.0.0. |
| V. Architectural Simplicity | Pass | Removes the only build tooling, the generator and the Node dependency. Simpler than 001. |
| Technology and Quality Constraints | Pass | Styling is one plain, hand-written CSS file (2.0.0). Application boxes are hand-written HTML in the served page, which does not fetch data at runtime (3.0.0). |
| Dependencies (Principle III) | Pass | None. Tailwind, daisyUI and Node are removed. |
| Third-party assets | Pass | None loaded. |
| Analytics and personal data | Pass | None collected. |
| Theme switch | Pass | Radio inputs and `:has()` in CSS, with no JavaScript (001 FR-014/FR-015). |

**Gate result**: Pass. No violations remain. The Complexity Tracking table below is kept as the record of the two points that the 3.0.0 amendment resolved.

**Post-design re-check**: The design adds no layer, no dependency and no runtime data. All principles pass.

## Project Structure

### Documentation (this feature)

```text
specs/002-static-app-cards/
├── plan.md                  # This file
├── research.md              # Phase 0: decisions and rationale
├── data-model.md            # Phase 1: the application box and its states
├── quickstart.md            # Phase 1: run locally, validate, admin edit cycle
├── contracts/
│   ├── box-markup.md        # Phase 1: the HTML contract for one application box
│   └── admin-checklist.md   # Phase 1: what the admin checks after each edit
├── checklists/requirements.md
└── spec.md
```

`tasks.md` is not created by this command.

### Source Code (repository root)

```text
site/                          # The only folder served; all files hand-written and committed
├── index.html                 # The page: header, hero, theme switch, boxes, footer
├── style.css                  # The one stylesheet: tokens, layout, box states, themes
├── mockups/                   # One hand-authored SVG per preview application (unchanged)
└── thumbnails/                # One 1280x800 WebP per application (unchanged)

deploy/nginx/
├── nexus.conf                 # Stylesheet caching changed: revalidate, no immutable (see research R4)
└── security-headers.conf      # Unchanged

specs/                         # Feature documents (not served)
.specify/                      # Constitution and templates (not served)
```

**Removed by this feature** (implementation tasks, not this plan):
- `data/apps.json`
- `src/index.template.html`, `src/input.css`
- `scripts/build-site.mjs`, `tests/build-site.test.mjs`
- `package.json`, `package-lock.json`, and the `node_modules` folder
- The `.gitignore` entries for `site/index.html` and `site/style.css`, because both are now committed

**Structure Decision**: A plain static site. Everything served is hand-written and committed, and Node is not needed by the site or the repository. Only `site/` is served, as the 001 plan already decided.

## Complexity Tracking

> Resolved by constitution 3.0.0 (2026-10-16). Kept as the record of why the two rules changed.

| Violation (before 3.0.0) | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle IV: app list was required to be data, not markup, for 50 applications | The owner asked for static HTML and "just a few" applications. A data file plus a generator adds a build step for five boxes. | Keeping the data file and generator contradicted the owner's direction. A runtime loader adds JavaScript (FR-009). |
| Technology constraint: application data compiled from a source file | Same as above | Same as above |

No violations remain. `/speckit-tasks` can now generate work without conflicting with the constitution.

## Phase 0 and Phase 1 outputs

- [research.md](research.md): decisions R1 to R8 (stylesheet, box markup, grid for one to five boxes, caching, theme switch, admin workflow, Node removal, checklist location).
- [data-model.md](data-model.md): the application box, its three statuses and the page's sections.
- [contracts/box-markup.md](contracts/box-markup.md): the HTML the admin writes for each box.
- [contracts/admin-checklist.md](contracts/admin-checklist.md): the checklist that satisfies FR-008.
- [quickstart.md](quickstart.md): local run, validation, and the edit cycle.

## Follow-up documents to update (not in this plan's scope)

These still describe the old design and must be updated when the feature is implemented:
- `README.md`: tech stack, project structure, the build commands, and the contract section.
- `DEPLOYMENT.md`: release layout and the testing chapter, where the build step is described.
- `deployment-discussion.md`, point 7: "generated and not committed" no longer holds.
- `.gitignore`: remove the generated-output rules.
