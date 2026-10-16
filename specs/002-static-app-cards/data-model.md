# Data Model: Static Application Cards

**Date**: 2026-10-16 | **Plan**: [plan.md](plan.md) | **Spec**: [spec.md](spec.md) | **Contract**: [contracts/box-markup.md](contracts/box-markup.md)

There is no data store. The model below describes what the HTML holds.

## Front page (`site/index.html`)

| Section | Content | Rule |
|---|---|---|
| Header | Wordmark, theme switch (Light, Dark) | No choice selected by default (001 FR-014) |
| Hero | `<h1>` "Mikrite Nexus", one description paragraph | Placeholder text until the owner supplies it |
| Applications | `<h2>` "Applications", then either the box list or the empty state | Zero to five boxes (FR-003) |
| Footer | "Copyright © {year} Mikrite", release version | Set by hand on each edit (spec Clarifications) |

## Application box

One `<li>` inside the application list. Attributes, as the spec names them:

| Attribute | Where it lives | Required | Rule |
|---|---|---|---|
| name | `<h3>` text | Yes | Short, wraps if long (edge case) |
| description | `<p>` text | Yes | One or two sentences |
| status | Class on the `<li>` and the chip text | Yes | One of `live`, `preview`, `unavailable` (spec Clarifications) |
| thumbnail | `<img>` `src` | Yes | Path to a 1280 × 800 WebP in `site/thumbnails/` |
| mock-up | `<img>` `src` | Preview only | Path to an SVG in `site/mockups/` |
| destination | `<a>` `href` | Live only | Absolute `https://` URL or root-relative path |

### States

| Status | Markup | Visible result | Activatable |
|---|---|---|---|
| `live` | Wrapped in `<a>` with `href`; chip "Live" | Thumbnail, name, description, highlight on hover and focus | Yes, same tab (spec Clarifications) |
| `preview` | Not a link; `<div>` with `aria-disabled="true"` and `tabindex="0"`; thumbnail, mock-up image, chip "Preview" | Mock-up shown over the card with a "Preview" label | No; focusable, announced as disabled |
| `unavailable` | Not a link; `<div>` with `aria-disabled="true"` and `tabindex="0"`; chip "Unavailable" | Thumbnail with the "Unavailable" chip | No; focusable, announced as disabled |

Transitions: a box changes status only by editing its markup (preview to live is the usual move). No runtime transition exists.

## Empty state

When the application list has no `<li>`, the page shows the panel "No applications yet" in place of the grid (FR-005). The admin adds or removes the panel with the list, so it is also hand-written.

## Validation

No automatic validation. The rules above are checked by the admin using [contracts/admin-checklist.md](contracts/admin-checklist.md). A box that breaks a rule still renders, and the mistake is visible on the page (spec edge case).
