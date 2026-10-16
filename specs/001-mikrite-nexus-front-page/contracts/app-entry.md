# Contract: Application Entry

**Version**: 1.0.0 | **Date**: 2026-10-15 | **Owner**: Nexus hub

> **Superseded by [002-static-app-cards](../../002-static-app-cards/spec.md) (2026-10-16).** This contract for a JSON array in `data/apps.json` is withdrawn. An application box is now a block of HTML in the front page, with the same fields (name, description, status, thumbnail, mock-up or link) written by hand. The field rules below stay as a guide for that markup; the build-time validation and the file-based entry no longer apply.

This is the public contract for adding an application to the Nexus front page. Constitution
Principle III requires it to be documented in the README before a second application relies on it.
Any breaking change must be called out in the pull request and reflected here.

## Shape

The hub reads a JSON array from `data/apps.json` at build time:

```json
[
  {
    "id": "notes",
    "name": "Notes",
    "description": "Quick capture for ideas that are not ready to become tasks.",
    "status": "preview",
    "mockup": "notes.svg"
  }
]
```

## Field rules

| Field | Rule |
|---|---|
| `id` | Matches `^[a-z][a-z0-9-]{1,39}$`. Unique across the array. |
| `name` | Trimmed length 1-40. |
| `description` | Trimmed length 1-160. |
| `status` | One of `live`, `preview`, `unavailable`. |
| `href` | Only for `live`. Absolute `https://` URL, or a root-relative path beginning with `/`. Never `javascript:` or `data:`. |
| `mockup` | Required for `preview`; optional for `unavailable`; not used for `live`. A file name in `site/mockups/`, matching `^[a-z0-9][a-z0-9.-]*\.svg$`. |
| `thumbnail` | Required for every status. A file name in `site/thumbnails/`, matching `^[a-z0-9][a-z0-9.-]*\.webp$`. WebP, 16:10, exported at 1280×800 pixels. Shown in the same 16:10 card area as the mock-up. |
| `mockupAlt` | Optional string. Empty by default. |

Fields not listed are ignored. Extra fields are not an error, so the contract can grow.

## Behavior

- Entries that fail validation **fail the build**, naming the entry id and the broken field. Invalid data never reaches the published page.
- If the array is empty (`[]`), the build generates the empty state "No applications yet" (FR-005). An empty array is valid; an invalid entry is not.
- Order is the array order.
- Adding an entry requires editing `data/apps.json` and rebuilding; no HTML or CSS changes (FR-011, SC-005).

## Non-goals (v1)

- No remote loading of the list. The list is in the repository and the page is static.
- No sorting, filtering or categories. Spec assumptions defer these.
- No per-entry styling. Visual changes are made in CSS tokens, not in entries.

## Example: promoting a preview to live

Before:

```json
{ "id": "notes", "name": "Notes", "description": "...", "status": "preview", "mockup": "notes.svg" }
```

After:

```json
{ "id": "notes", "name": "Notes", "description": "...", "status": "live", "href": "https://notes.example.org/", "thumbnail": "notes.webp" }
```

Verify the link resolves before release (constitution Principle II).
