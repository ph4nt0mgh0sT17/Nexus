# Contract: Application Box Markup

**Date**: 2026-10-16 | **Plan**: [../plan.md](../plan.md) | **Data**: [../data-model.md](../data-model.md)

This replaces the JSON contract in 001 ([001 contract](../../001-mikrite-nexus-front-page/contracts/app-entry.md)). The admin writes each box as HTML in `site/index.html`, following this shape. The browser and the admin are the only consumers; no tool reads it.

## Shape

Live box:

```html
<li class="app app--live">
  <a class="app__link" href="https://example.org/tasks">
    <img class="app__thumb" src="thumbnails/tasks.webp" width="1280" height="800" alt="">
    <span class="app__chip">Live</span>
    <h3 class="app__name">Tasks</h3>
    <p class="app__text">Plan, track and finish the work you have in hand.</p>
  </a>
</li>
```

Preview box (shows its thumbnail on the card, and its mock-up as the reviewable preview):

```html
<li class="app app--preview">
  <div class="app__card" aria-disabled="true" tabindex="0">
    <img class="app__thumb" src="thumbnails/tasks.webp" width="1280" height="800" alt="">
    <img class="app__mockup" src="mockups/tasks.svg" width="1280" height="800" alt="Mock-up of the Tasks application">
    <span class="app__chip">Preview</span>
    <h3 class="app__name">Tasks</h3>
    <p class="app__text">Plan, track and finish the work you have in hand.</p>
  </div>
</li>
```

Unavailable box:

```html
<li class="app app--unavailable">
  <div class="app__card" aria-disabled="true" tabindex="0">
    <img class="app__thumb" src="thumbnails/tasks.webp" width="1280" height="800" alt="">
    <span class="app__chip">Unavailable</span>
    <h3 class="app__name">Tasks</h3>
    <p class="app__text">Plan, track and finish the work you have in hand.</p>
  </div>
</li>
```

## Rules

- **Class names** (`app`, `app--live`, `app--preview`, `app--unavailable`, `app__link`, `app__card`, `app__thumb`, `app__mockup`, `app__chip`, `app__name`, `app__text`) are defined in `site/style.css`. Use only these; a new class does nothing until it is added to the stylesheet.
- **Status** is set by the `app--*` class on the `<li>`. A box has exactly one status class.
- **Live** boxes wrap their content in one `<a class="app__link">` with an absolute `https://` or root-relative `href`. No `target` attribute (spec Clarifications: same tab).
- **Preview and unavailable** boxes never contain an `<a>`. They use `aria-disabled="true"` on `app__card`, and `tabindex="0"` so keyboard users can reach them. Screen readers announce the name and "dimmed". Activating them does nothing (001 FR-010, 002 FR-007).
- **Thumbnail** `<img class="app__thumb">` is required for every status: a WebP path under `thumbnails/`, with `width="1280" height="800"` (001 FR-003).
- **Mock-up** `<img class="app__mockup">` is required for a preview box only: an SVG path under `mockups/`, whose `alt` names the application (001 FR-006). Its styling places it over the thumbnail area.
- **Decorative images** (the thumbnail of a live box, whose name is already in the text) use `alt=""`.
- **Missing image**: if a thumbnail or mock-up file is missing, the page shows the neutral placeholder defined in `site/style.css` (see T018a). The box keeps its name and text.
- **Heading**: each name is an `<h3>` (the page has one `<h1>`, and "Applications" is an `<h2>`).
- **Text** is plain text. Escape `<`, `>`, `&` in names and descriptions (for example, `&amp;`).
- **Order** in the HTML is the order on the page.
- **Count**: zero to five boxes (spec FR-003). Zero boxes means the empty-state panel instead of the list.

## Empty state

```html
<div class="empty">
  <h3 class="empty__title">No applications yet</h3>
  <p class="empty__text">Applications will appear here once they are added.</p>
</div>
```

Shown in place of the `<ul class="apps">` list when there are no boxes.
