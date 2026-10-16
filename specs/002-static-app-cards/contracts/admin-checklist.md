# Admin Checklist: Application Boxes

**Date**: 2026-10-16 | **Spec**: [FR-008](../spec.md) | **Contract**: [box-markup.md](box-markup.md)

Run this checklist after every edit to `site/index.html`, before committing or publishing. It is the only validation for the page (spec FR-008).

## Before you edit

- [ ] Start the local server (see [quickstart.md](../quickstart.md)), so you can see each change on reload.

## Each box

- [ ] The box is an `<li>` with exactly one status class: `app--live`, `app--preview` or `app--unavailable`.
- [ ] The name is in an `<h3 class="app__name">`, and the description in an `<p class="app__text">`. Both are plain text.
- [ ] The thumbnail (or, for a preview, the mock-up) exists at the path in `src`, and its file is in `site/thumbnails/` or `site/mockups/`.
- [ ] A live box has an `<a class="app__link" href="...">` with a working address. A preview or unavailable box has no `<a>`.
- [ ] Only classes from [box-markup.md](box-markup.md) are used.

## The list

- [ ] Between zero and five boxes. Zero boxes shows "No applications yet".
- [ ] The order of the boxes is the order you want on the page.

## The footer

- [ ] The copyright year is the year of this edit.
- [ ] The release version is correct (`0.0.0` for local builds; `1.0.0` for the first release).

## The page

- [ ] Reload at 375 px and at 1280 px width: every box is visible, the grid wraps, and there is no horizontal scroll.
- [ ] Switch the theme to Light and to Dark: every box is readable.
- [ ] Tab through the page: every box is reachable, and a live box is activated with Enter.
- [ ] The browser's developer tools show no console errors.

## Before release

- [ ] Live boxes: each `href` resolves to a successful response. This check is deferred until the first live box exists (spec Clarifications).
