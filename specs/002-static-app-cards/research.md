# Research: Static Application Cards

**Date**: 2026-10-16 | **Plan**: [plan.md](plan.md) | **Spec**: [spec.md](spec.md)

Each decision below is final unless the owner changes it. Where an alternative was rejected, the reason is given.

## R1. Styling: one hand-written CSS file

**Decision**: `site/style.css` is one plain CSS file, written by hand and committed. It uses custom properties for colours, spacing and type, defined on `:root` and redefined for dark mode. No framework, no preprocessor, no compile step.

**Rationale**: The owner decided to drop Tailwind and daisyUI (constitution 2.0.0, spec FR-012). With five boxes and a single page, the stylesheet is a few hundred lines. The design tokens from [001 design.md](../001-mikrite-nexus-front-page/design.md) carry over as custom properties, so the look does not change.

**Alternatives considered**:
- Keep Tailwind with a build step: rejected by the owner. It adds Node, pinned dependencies and a silent failure mode for an admin who uses a class that is not compiled in.
- A CSS preprocessor (Sass, Less): rejected. Nothing in a page this size needs one, and it brings a compile step back.

## R2. Box markup: repeated HTML, no template

**Decision**: Each application box is a block of HTML inside the application list in `site/index.html`. The admin copies an existing box to add one. The markup contract is in [contracts/box-markup.md](contracts/box-markup.md).

**Rationale**: Matches the owner's request for static HTML and admin edits on the fly. Five boxes make repetition cheap.

**Alternatives considered**:
- Server-side includes (nginx SSI): rejected. It needs an nginx directive and moves markup into a second file. The spec's out-of-scope rules say no server-side editing.
- Client-side rendering from a list in the script: rejected. FR-009 forbids a script that renders the boxes.
- Keep `data/apps.json` and a copy step: rejected. The owner asked to drop it.

## R3. Grid for zero to five boxes

**Decision**: The application list is a CSS grid with `grid-template-columns: repeat(auto-fill, minmax(16rem, 20rem))` and `justify-content: start`. The grid wraps; a single box keeps the card width and does not stretch across the page.

**Rationale**: The spec's edge case says one box must not be stretched across the page (`justify-content: start` gives that). `auto-fill` with a fixed track width keeps one to five boxes wrapping with no horizontal scroll at 375 px, because the minimum width is well under the phone width minus the 16 px gutters.

**Alternatives considered**:
- `auto-fit`: rejected. With few boxes it stretches them to fill the row, which the spec forbids.
- Flexbox with `flex-wrap`: workable, but the grid keeps the equal-row heights that the cards need.
- A fixed number of columns with media queries: rejected. It breaks the spec's "no layout change when a box is added" rule.

## R4. Stylesheet caching: revalidate, no immutable

**Decision**: `deploy/nginx/nexus.conf` changes the `style.css` rule from `public, max-age=31536000, immutable` to `no-cache`, the same as the page. The HTML does not carry a version query string.

**Rationale**: The stylesheet is now edited by hand, so nothing changes its URL when it changes. The current rule would let a browser keep an old stylesheet for a year. `no-cache` makes the browser ask, and nginx answers `304 Not Modified` when nothing changed, which is cheap at this size.

**Alternatives considered**:
- Keep `immutable` and bump `?v=` by hand on every change: rejected. One forgotten bump means a year of stale styles, and the admin would have to remember.
- Keep `immutable` and rename the file on each change: rejected for the same reason, and it breaks bookmarks.

## R5. Theme switch without JavaScript

**Decision**: Two radio inputs, `Light` and `Dark`, sit in the header. The stylesheet applies the chosen theme with `:root:has(#theme-light:checked)` and `:root:has(#theme-dark:checked)`. Light is ticked by default (FR-013), so the Light tokens apply on first load; the dark media query is guarded so it does not apply while Light is ticked. The device setting therefore applies only in the sense that Dark is still one click away. The choice is not stored between visits.

**Rationale**: This is 001's decision (FR-014, FR-015) written in plain CSS instead of daisyUI's `theme-controller`. `:has()` is the mechanism the 001 edge case already accepts: in a browser without it, the switch does nothing and the device setting applies.

**Alternatives considered**:
- A script that stores the choice: rejected, FR-009 and FR-015 forbid it.
- Hidden checkboxes with labels: equivalent, but radio inputs give the group a single keyboard tab stop.

## R6. Admin workflow: edit the committed file

**Decision**: `site/index.html` is the only source of the page's markup. The admin edits it in the repository, or on the server's copy during a release. There is no template and no generated file.

**Rationale**: Answered in spec Clarifications (2026-10-16). Removing the template removes the duplicate source.

**Alternatives considered**:
- A template plus a copy step: rejected. Two sources invite drift, and the spec removed the generator.
- An admin screen with sign-in: out of scope. It needs a server.

## R7. Footer year and version by hand

**Decision**: The admin updates the copyright year and the release version in the footer with each edit (spec Clarifications). The checklist in [contracts/admin-checklist.md](contracts/admin-checklist.md) includes both.

**Rationale**: Owner's answer; no script (FR-009).

## R8. Node and Docker

**Decision**: Node is removed from the repository. Docker stays, for local testing only, running `nginx:alpine` with `site/` mounted read-only, as in 001 and `DEPLOYMENT.md`.

**Rationale**: Node was used only by the build and tests, and both are removed. The stack otherwise stays as decided: nginx in production, Docker for local testing.

**Alternatives considered**:
- Keep Node for an HTML validator: rejected for now. The validator can be run from a browser or a one-off command when needed; keeping a dependency for it is not justified by the current requirements.
- `python -m http.server` for local testing: rejected, 001 decided against it because it hides nginx configuration differences.

## R9. Link checks

**Decision**: Deferred, as the spec says. No link check is built. The release check in `DEPLOYMENT.md` applies once the first live box exists.

## Performance budget

No script, one stylesheet, and SVG and WebP images loaded by `img` elements that are not render-blocking. The page is expected to be well under 100 KB compressed before images; the quickstart measures it.
