# Implementation Plan: Mikrite Nexus Front Page

**Branch**: `001-mikrite-nexus-front-page` | **Date**: 2026-10-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-mikrite-nexus-front-page/spec.md`, [tech-stack-decisions.md](tech-stack-decisions.md), and the design focus requested for this plan.

## Summary

A single static page: title, a short description, and a grid of application cards generated from data at build time. Each card is `live` (links to the app), `preview` (shows a labelled SVG mock-up, not a link), or `unavailable`. The served page is plain HTML with a Tailwind CSS v4 + daisyUI v5 stylesheet and ships no JavaScript. nginx serves the static files.

Design direction, "a hub with spokes": a modern, high-contrast look built from a custom daisyUI light and dark theme, a fluid type scale, an auto-fill card grid that stacks on phones without breakpoints, and restrained motion. See [design.md](design.md).

The owner approved Tailwind + daisyUI and a constitution amendment (version 1.1.0) on 2026-10-15. The amendment also resolves the no-JavaScript question: a build-time generator turns the data file into static markup, so FR-011 is met without client code.

## Technical Context

**Language/Version**: HTML5 and CSS3 in the output. Node.js 20+ for build tooling and tests (JavaScript ES modules, Node standard library only in the generator).

**Primary Dependencies**:
- Build-time only, pinned to exact versions: `tailwindcss` 4.x, `@tailwindcss/cli` 4.x, `daisyui` 5.x. Exact versions are chosen during implementation and recorded in `package.json` and the lockfile.
- No runtime dependencies. No client-side JavaScript.

**Storage**: `data/apps.json` (application entries, source of truth). Mock-ups in `site/mockups/`. No database.

**Testing**: `node --test` for the build's pure functions (entry validation, card generation, empty state). No test dependencies. Browser checks at 375 px and 1280 px, light and dark, keyboard, contrast and performance, per [quickstart.md](quickstart.md).

**Target Platform**: Static files served by nginx (production Linux server, Docker `nginx:alpine` locally). Browsers: current and previous major of Chrome, Edge, Firefox and Safari.

**Project Type**: Static web site (single page) with a build step.

**Performance Goals**: One stylesheet, zero scripts. Critical transfer under 100 KB before images (constitution). No third-party requests. Title text drives Largest Contentful Paint. Mock-up SVGs lazy-loaded, each under 4 KB.

**Constraints**:
- Tailwind and daisyUI only as build-time tools, pinned, never loaded from a CDN (constitution, amended 1.1.0).
- No runtime data fetching; no client framework; no web fonts; no analytics.
- Phone width 375 px with a 16 px gutter and no horizontal scroll (FR-009).
- Keyboard operable; WCAG 2.2 AA contrast and focus visibility.
- Respects `prefers-color-scheme` and `prefers-reduced-motion`.

**Scale/Scope**: 2-3 entries at launch; layout must stay usable with 50 or more (constitution Principle IV).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | How the plan meets it |
|---|---|---|
| I. Code Quality | Pass | The build script has small single-purpose functions (`validateEntry`, `renderCard`, `renderGrid`) with purpose-named identifiers. No dead code; generated output is committed, not hand-edited. Validator and HTML checks are part of done. |
| II. Testing | Pass | Build logic tested with `node --test` without a browser. Phone and desktop, light and dark, accessibility and link checks are in quickstart. |
| III. Maintainability | Pass with a README task | Markup generated from `data/`, styling source in `src/`, output in `site/`. Visual values are daisyUI and `@theme` tokens defined once. Tailwind and daisyUI are pinned. The entry contract must be added to the README before release ([contracts/app-entry.md](contracts/app-entry.md)). |
| IV. Scalability | Pass | The list is data. Adding an app edits `data/apps.json` only. Auto-fill grid. Static output with no server dependency. Invalid data fails the build, so one bad entry cannot break the published page. |
| V. Architectural Simplicity | Pass with justified additions | Build tooling is the approved exception. The one extra piece is a Node generator with no dependencies, justified below. No framework, router, or runtime data layer. |
| Technology constraints (amended 1.1.0) | Pass | HTML5 and CSS3 output; Tailwind v4 and daisyUI v5 at build time; no client JavaScript shipped. |
| Dependencies (Principle III) | Pass | Tailwind and daisyUI justified by [tech-stack-decisions.md](tech-stack-decisions.md) and the 1.1.0 amendment. No other dependency. |
| Third-party assets | Pass | None loaded in the page. |
| Analytics and personal data | Pass | None collected. |

**Gate result**: Pass. The styling-stack gate is resolved by the constitution amendment.

**Post-design re-check**: Pass. The design, data model and contract add no runtime layers.

## Project Structure

### Documentation (this feature)

```text
specs/001-mikrite-nexus-front-page/
├── plan.md                  # This file
├── research.md              # Phase 0: decisions and rationale
├── design.md                # Visual system: concept, theme tokens, layout, states, motion
├── data-model.md            # Phase 1: Application Entry and front page state
├── quickstart.md            # Phase 1: build, run and validation guide
├── contracts/
│   └── app-entry.md         # Phase 1: public contract for adding applications
├── tech-stack-decisions.md  # Input from the earlier discussion (unchanged)
└── spec.md                  # Feature specification
```

`tasks.md` is not created by this command.

### Source Code (repository root)

```text
data/
└── apps.json                  # Application entries (source of truth; contract in contracts/app-entry.md)

src/
├── input.css                  # Tailwind entry: imports, daisyUI plugin, nexus-light and nexus-dark themes, @theme tokens
└── index.template.html        # Page shell: header, hero, empty placeholder for the application grid

scripts/
└── build-site.mjs             # Validates data/apps.json, generates cards into site/index.html, copies mockups (no dependencies)

site/                          # The only folder served in production (all committed)
├── index.html                 # Generated from src/index.template.html + data/apps.json
├── style.css                  # Generated by Tailwind CLI (--minify)
└── mockups/
    ├── notes.svg              # One hand-authored SVG per application
    └── ...

tests/
└── build-site.test.mjs        # node --test: validation, card generation per status, empty state

package.json                   # Scripts: build, dev; pinned devDependencies
README.md                      # Adds the app entry contract section (Principle III)
```

**Structure Decision**: A static site with a build step. Source lives in `data/`, `src/`, `scripts/` and `tests/`. Only `site/` is served, which matches the tech doc's rule that only the served output is deployed. Generated files (`site/index.html`, `site/style.css`) are committed so the production server needs no Node.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Node build script `scripts/build-site.mjs` (no dependencies) | FR-011 and Principle IV require the app list to be data, not hand-written markup, and the page must ship no JavaScript. A build-time generator is the only way to meet both. | Hand-written cards fail FR-011 and need editing for every app. Runtime rendering ships JavaScript, which the tech doc rejects. |
| Tailwind CSS v4 + daisyUI v5 (build-time) | Owner decision; recorded in the constitution amendment 1.1.0. | Plain CSS was the earlier default; the owner rejected it. Revisit if the build becomes overhead. |

## Open Decisions (not blocking tasks)

1. **Generated output committed** (`site/index.html`, `site/style.css`): decided as committed, to keep the server Node-free. Revisit if generated diffs cause merge noise.
2. **Production deployment and HTTPS**: open. Deployment model, server OS, domain, HTTPS and nginx configuration are parked in [deployment-discussion.md](deployment-discussion.md). They do not affect this plan's design.
3. **Brand assets**: none provided. Placeholder mark and palette are used; swap the theme values in `src/input.css` when real assets exist.
4. **Spec clarification**: [spec.md](spec.md) still says "plain CSS, no build step" in Clarifications and Assumptions. Update those lines to reflect the amendment before tasks are generated.
