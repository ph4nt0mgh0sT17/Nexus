# Admin guide: application boxes

The front page is one hand-written file, `site/index.html`, with one stylesheet, `site/style.css`. Nothing generates or builds them. To change the applications shown on the page, edit `site/index.html` and reload the browser.

This file is not served. Keep it in the repository next to the page.

## Adding and removing an application

- **Add:** copy an existing `<li class="app ...">` box, change its fields as described in [specs/002-static-app-cards/contracts/box-markup.md](specs/002-static-app-cards/contracts/box-markup.md), and paste it into the `<ul class="apps">` list.
- **Remove:** delete the whole `<li>` for that box.
- **Reorder:** move the `<li>` elements. The page shows them in HTML order.
- **Limit:** show zero to five boxes. The design is tested for five.
- **No build:** save the file and reload the browser. Nothing else needs to run.

## After each edit: checklist

- [ ] The box is an `<li>` with exactly one status class: `app--live`, `app--preview` or `app--unavailable`.
- [ ] The name is in an `<h3 class="app__name">`, and the description in a `<p class="app__text">`. Both are plain text.
- [ ] The thumbnail (or, for a preview, the mock-up) exists at the path in `src`, and its file is in `site/thumbnails/` or `site/mockups/`.
- [ ] A live box has an `<a class="app__link" href="...">` with a working address. A preview or unavailable box has no `<a>`.
- [ ] Only classes from the contract are used.
- [ ] Between zero and five boxes. Zero boxes shows "No applications yet".
- [ ] The order of the boxes is the order you want on the page.
- [ ] The copyright year is the year of this edit.
- [ ] The release version is correct (`0.0.0` for local builds; `1.0.0` for the first release).
- [ ] Reload at 375 px and at 1280 px width: every box is visible, the grid wraps, and there is no horizontal scroll.
- [ ] Switch the theme to Light and to Dark: every box is readable.
- [ ] Tab through the page: every box is reachable, and a live box is activated with Enter.
- [ ] The browser's developer tools show no console errors.

Before a release, also check that every live box's link works. This check is deferred until the first live box exists.

## Empty state

When no boxes remain, replace the whole `<ul class="apps">...</ul>` with this panel:

```html
<div class="empty">
  <h3 class="empty__title">No applications yet</h3>
  <p class="empty__text">Applications will appear here once they are added.</p>
</div>
```

## Edit check (verified once)

Edit cycle (T015): changed one box's description in `site/index.html`, reloaded the page, and the new text appeared. Then reverted. No other file was changed and no build ran.
