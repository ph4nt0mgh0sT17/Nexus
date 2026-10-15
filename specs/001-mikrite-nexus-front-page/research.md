# Research: Mikrite Nexus Front Page

**Date**: 2026-10-15 | **Plan**: [plan.md](plan.md) | **Spec**: [spec.md](spec.md)

This file records the technical decisions and the reasoning. Conflicts between inputs are resolved here, with the resolution owned by the repository owner.

## 1. Styling stack (resolved)

**Decision**: Tailwind CSS v4 (CLI) with daisyUI v5, as in [tech-stack-decisions.md](tech-stack-decisions.md). Approved by the owner on 2026-10-15 with a constitution amendment, version 1.1.0 (see the Sync Impact Report at the top of `.specify/memory/constitution.md`).

**Scope of the amendment**: a build-time styling toolchain only. Tailwind and daisyUI are pinned to exact versions, run through the Tailwind CLI, and are never loaded from a CDN in the served page.

**Superseded input**: [spec.md](spec.md) Clarifications (2026-10-15) chose plain CSS with no build step. That clarification is now overridden by the owner's decision. Record the change in the spec's Clarifications section during `/speckit-specify` follow-up or before tasks are generated.

**Rationale**:
- Tailwind v4 compiles only the classes used, so the stylesheet stays small (tech doc goal: tens of KB at most).
- daisyUI supplies accessible components and themes, and its theme system maps directly onto light and dark palettes.
- Tokens are defined once in `src/input.css` (`@theme`), which satisfies the constitution's rule that visual values are custom properties.

**Guard against the generic look** (the main risk the tech doc names): daisyUI's default themes are recognizable. The plan defines a custom daisyUI theme and uses Tailwind utilities for layout, so no stock daisyUI theme is shipped. See [design.md](design.md).

**Alternatives considered**:
- Plain CSS with custom properties: lightest and no build step. Remains the fallback if the build becomes overhead. Rejected by the owner.
- Bootstrap, Pico.css: rejected in the tech doc (heavier, recognizable).
- Tailwind CDN script: rejected by the tech doc, and disallowed by the amended constitution for the served page.

## 2. Application list and JavaScript (resolved)

**Decision**: No client-side JavaScript. The application list lives in `data/apps.json`. A build script, `scripts/build-site.mjs`, reads it and generates the application cards into `site/index.html` at build time. The served page is pure static HTML.

**Why this resolves the earlier conflict**: The tech doc says "no client-side JavaScript", and the spec (FR-011) and constitution Principle IV require the list to be data, not hand-written markup. With a build step now approved, a build-time generator satisfies both. The page ships zero JS.

**Options considered**

| Option | Data-driven | Client JS | Build step | Verdict |
|---|---|---|---|---|
| A. Hand-written cards in `index.html` | No | None | Tailwind only | Violates FR-011 and Principle IV |
| B. Build script generates cards from `data/apps.json` | Yes | None | Tailwind + small Node script | **Chosen** |
| C. Client JS renders cards at runtime | Yes | Yes | Tailwind only | Needs a justification the tech doc rejects; no requirement needs runtime rendering |

**Rationale**: The page is fully static and fast (no script to parse, no render-after-load flash, and it works with JavaScript disabled). The generator has no npm dependencies; it uses Node's standard library only. Node is therefore needed at build time for both Tailwind and the generator.

**Generated output**: `site/index.html` is generated and committed, so the repository's `site/` folder is directly deployable and the production server needs no Node. This answers the tech doc's open question about built CSS: `site/style.css` is also committed. Revisit if the generated files cause merge noise.

**Alternatives for the generator**: Eleventy or another static site generator would add a dependency the constitution asks us to justify. Not needed for one page; rejected under Principle V.

## 3. Mock-up format (decided)

**Decision**: Hand-authored SVG files in `site/mockups/<app-id>.svg`, referenced with `<img>` and `loading="lazy"`. Copied unchanged by the build.

**Rationale**: Screenshots of applications that do not exist would be fabricated, and raster images are heavy against the 100 KB budget. SVG is vector, typically 1-4 KB, and reviewable as text.

## 4. Fonts (decided)

**Decision**: System UI font stack. No web-font request.

**Rationale**: No third-party requests (constitution), no font payload, instant text. A self-hosted variable font is an upgrade path if the brand asks for one.

## 5. Color scheme handling (decided)

**Decision**: Two daisyUI themes, one light and one dark, both defined in `src/input.css`. The light theme is the default and the dark theme is selected by `prefers-color-scheme: dark`. No theme toggle in v1.

**Rationale**: Required by the constitution. daisyUI's `themes` option with `--prefersdark` handles the switch without JavaScript.

## 6. Motion (decided)

**Decision**: Hover and focus transitions only, 150-200 ms, on transform and color. Disabled under `prefers-reduced-motion: reduce` using Tailwind's `motion-safe:` and `motion-reduce:` variants.

## 7. Testing (decided)

**Decision**:
- Unit tests for the build logic (entry validation and card generation) with Node's built-in `node --test`, zero test dependencies. The build script exports its pure functions so the tests can import them.
- Browser-level checks (phone and desktop widths, light and dark, keyboard, contrast, performance) are documented in [quickstart.md](quickstart.md). Automated accessibility tooling (axe, Playwright) is deferred until a second page exists, per Principle V.

## 8. Serving and local testing (decided)

**Decision**: nginx in production. Local testing with Docker Desktop running `nginx:alpine`, with `site/` mounted read-only, as in the tech doc.

## 9. Build and watch workflow (decided)

**Decision**: Two commands, both from the repository root:

- `npm run build` runs the Tailwind CLI with `--minify` to write `site/style.css`, then runs `scripts/build-site.mjs` to write `site/index.html`.
- `npm run dev` runs the Tailwind CLI with `--watch` and the generator in watch mode. The generator re-runs on changes to `data/apps.json` or the template.

Both scripts are defined in `package.json`. The tech doc's watch command (`npx @tailwindcss/cli ... --watch`) is kept as the core of `dev`.

## 10. Performance budget (decided)

Constitution Principle IV, plus measurable targets for this plan:

- One stylesheet (`site/style.css`, minified, target under 20 KB; tech doc says "a few tens of KB at most") and no script on the critical path.
- HTML under 15 KB with the cards generated for 3 apps.
- Total transfer before images under 100 KB, compressed (constitution budget; SC-006).
- No third-party requests.
- Mock-up SVGs lazy-loaded, each under 4 KB.
- Explicit `width` and `height` on images to avoid layout shift.

## Resolved clarifications

| Item | Resolution |
|---|---|
| Target platform | Static files served by nginx to current and previous major of Chrome, Edge, Firefox, Safari |
| Technology stack | HTML5, CSS3 via Tailwind v4 + daisyUI v5, build-time generator in Node standard library |
| Storage of app entries | `data/apps.json`, compiled into `site/index.html` at build time |
| Mock-up format | SVG in `site/mockups/` |
| JavaScript | None shipped |
| Brand assets | Not provided. Placeholder mark and palette; see [design.md](design.md) |
