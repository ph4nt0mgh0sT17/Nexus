# Quickstart: Validate Static Application Cards

**Date**: 2026-10-16 | **Plan**: [plan.md](plan.md) | **Data**: [data-model.md](data-model.md) | **Contracts**: [box-markup.md](contracts/box-markup.md), [admin-checklist.md](contracts/admin-checklist.md)

## Prerequisites

- A browser (Chrome or Edge) with developer tools.
- No Node.js is needed. Docker is needed only for the pre-release check in §9.

## 1. Open the page in a browser

Open `site/index.html` directly in the browser. This is the default for edits: save, then reload. No server or build is needed. If the stylesheet does not load from disk in your browser, use §9 instead.

## 2. Check the three default boxes

Expected with the first delivery (Tasks, Notes, Archive, all `preview`):
- Three boxes, in order, each with its mock-up and a "Preview" chip.
- The title "Mikrite Nexus", the description, the theme switch and the footer are visible.

## 3. Check the admin edit cycle

1. Change one box's description in `site/index.html` and save.
2. Reload the browser. The new text appears, and no other file changed (SC-002).
3. Copy a box, change its name and images, and reload. The new box appears after the others.
4. Delete the copied box, and reload. The layout is as before.

## 4. Check zero and five boxes

- Empty the list (remove all `<li>` elements). Reload: "No applications yet" appears in place of the grid. Restore the list afterwards (SC-004).
- Copy a box until there are five. Reload at 375 px and at 1280 px. All five are visible, the grid wraps, and there is no horizontal scroll (SC-003). Remove the copies afterwards.
- With one box, the box keeps the card width and does not stretch across the page.

## 5. Check the theme and the keyboard

- Set the theme switch to Light, then Dark, then reload: the choice is not remembered (001 FR-015). Each theme keeps every box readable.
- On first load, Light is ticked and the page is light, even when the device is set to dark (FR-013).
- Tab through the page: every box is reachable; a live box is activated with Enter; a preview or unavailable box is announced as disabled and does nothing when activated (SC-005).

## 6. Check the page weight

Measure the transfer before images, compressed, with the server from §9 running on port 8080:

```bash
curl -s -H "Accept-Encoding: gzip" http://localhost:8080/index.html | wc -c
curl -s -H "Accept-Encoding: gzip" http://localhost:8080/style.css | wc -c
```

The two numbers together must be under 100 KB (SC-006). Confirm there is no `<script>` element:

```bash
grep -c "<script" site/index.html
```

The expected count is `0`.

## 7. Check the footer and version

The copyright line reads "Copyright © {year} Mikrite" with the year of this edit, and the release version (`0.0.0` locally) is shown.

## 8. Run the admin checklist

Run [admin-checklist.md](contracts/admin-checklist.md) in full before any commit.

## 9. Before release: check under nginx

Browser checks in §1 to §5 do not run the production nginx config, so the caching rules and security headers, including the CSP, are not tested there. Before each release, serve `site/` with the same nginx as production:

```bash
docker run --rm -p 8080:80 -v "$(pwd)/site:/usr/share/nginx/html:ro" nginx:alpine
```

Open `http://localhost:8080`, repeat §4 and §5, and confirm the stylesheet loads with no console errors.

## Known gaps

- Link checks are deferred until the first live box exists (spec Clarifications).
- No HTML or CSS validator is run automatically. Run one by hand when the markup or styles change (constitution Principle I).
