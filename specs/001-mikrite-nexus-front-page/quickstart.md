# Quickstart: Validate the Mikrite Nexus Front Page

**Date**: 2026-10-15 | **Plan**: [plan.md](plan.md) | **Data**: [data-model.md](data-model.md) | **Contract**: [contracts/app-entry.md](contracts/app-entry.md)

This guide proves the feature works end to end. It is a run and check guide, not a build guide.
Implementation tasks belong in `tasks.md`.

## Prerequisites

- Docker Desktop running (for nginx locally, matching production).
- Node.js 20 or later (build and tests; the served site needs no Node).
- Dependencies installed once: `npm install` from the repository root.
- A browser with DevTools (Chrome or Edge recommended).
- Repository checked out on branch `001-mikrite-nexus-front-page`.

## 1. Run the build and the tests (no browser)

```bash
npm run build
node --test tests/build-site.test.mjs
```

Expected: the build succeeds and writes `site/style.css` and `site/index.html`; all tests pass. The tests cover entry validation (see [contracts/app-entry.md](contracts/app-entry.md) field rules), card generation for each status, and the empty state. An invalid entry in `data/apps.json` must make the build fail.

## 2. Serve the site locally

Start the CSS watcher and generator in one terminal (leave running):

```bash
npm run dev
```

In a second terminal, from the repository root:

```bash
docker run --rm -p 8080:80 -v "$PWD/site:/usr/share/nginx/html:ro" nginx:alpine
```

Open `http://localhost:8080`. Saving a file rebuilds the output; refresh the browser. The container reads from disk and does not need restarting.

## 3. Check the content (FR-001, FR-002, SC-001)

- The title "Mikrite Nexus" is the largest text on the page.
- A one-to-two sentence description is visible directly under the title.
- The footer shows "Copyright © {year} Mikrite" with the current year, and "v0.0.0" for a local build.
- With no apps configured (temporarily set `data/apps.json` to `[]` and run `npm run build`), the empty state "No applications yet" appears in place of the grid. Restore the file afterwards.

## 4. Check the boxes (FR-003, FR-004, FR-006, FR-008)

With the sample list containing one `live`, one `preview` and one `unavailable` entry:

- Each entry shows one card with name, description and a chip.
- The `live` card links to its `href`; activating it with mouse, Enter, or the keyboard navigates there.
- The `preview` card shows its mock-up, labelled "Preview" and "Coming soon". It is not a link.
- The `unavailable` card is shown muted and cannot be activated.
- Changing one entry from `preview` to `live` changes its chip and footer only; the card size does not change.

## 5. Check layout and responsiveness (FR-009, SC-002, constitution Principle II)

Use DevTools device emulation:

| Width | Check |
|---|---|
| 375 px (iPhone SE size) | Single column; 16 px side gutter; no horizontal scrollbar; title and description visible without scrolling at 667 px height |
| 1280 px | Multiple columns; title, description and first row of cards visible at 720 px height |

Repeat both widths with light and dark color schemes (DevTools "Rendering" panel, or `prefers-color-scheme` emulation).

Also add 50 test entries temporarily and confirm the grid wraps without horizontal scroll (constitution Principle IV).

## 6. Check keyboard and accessibility (FR-010, SC-004, constitution WCAG 2.2 AA)

- Press Tab from the top of the page. Every card, live or preview, receives focus in order.
- Focus ring is visible on every focused card in both color schemes.
- Enter on a live card navigates to its `href`. Preview and unavailable cards do nothing when activated.
- Run the Lighthouse accessibility audit (Chrome DevTools) and resolve any contrast or name warnings.
- Check contrast of the muted text token on both surfaces with a contrast checker; target 4.5:1 for body text.
- Turn on "Emulate CSS prefers-reduced-motion: reduce" and confirm hover lifts and transitions are off.

## 7. Check performance budget (constitution Principle IV)

In DevTools Network with cache disabled:

- Exactly one stylesheet (`style.css`) loads, and no script loads.
- No third-party requests.
- Transfer before images is under 100 KB, compressed (gzip or brotli).
- Each mock-up SVG is under 4 KB.

## 8. Check the broken-link rule (constitution Principle II)

Deferred for the proof of concept: all entries are previews, so there are no links to check. Before the first entry with `status: "live"` is published, every `href` must resolve (`curl -I <href>` returning 2xx or 3xx).

## Expected outcome

Every step above passes, and the page shows the title, description and application boxes at phone and desktop widths in both color schemes, with no client-side errors in the console.
