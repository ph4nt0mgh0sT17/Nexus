# Data Model: Mikrite Nexus Front Page

**Date**: 2026-10-15 | **Plan**: [plan.md](plan.md) | **Contract**: [contracts/app-entry.md](contracts/app-entry.md)

## Entities

### Front Page (singleton, not stored)

The page itself has no stored record. It is composed from static markup and the application list.

| Field | Source | Notes |
|---|---|---|
| `title` | `index.html` | Fixed: "Mikrite Nexus" (FR-001) |
| `description` | `index.html` | One to two sentences (FR-002) |
| `apps` | `data/apps.json` | Zero or more Application Entries, read at build time |
| `emptyMessage` | `index.html` | Shown when no valid entries remain (FR-005) |

### Application Entry

One object per application in the `APPS` array.

| Field | Type | Required | Rules |
|---|---|---|---|
| `id` | string | Yes | Lowercase slug: `^[a-z][a-z0-9-]{1,39}$`. Unique in the list. Used for the mock-up file name and the DOM id. |
| `name` | string | Yes | 1-40 characters after trimming. Long names wrap; they are not truncated (spec edge case). |
| `description` | string | Yes | 1-160 characters after trimming. Clamped visually to 3 lines in the card; the full text stays in the DOM for screen readers. No `title` attribute is used. |
| `status` | enum | Yes | `live`, `preview` or `unavailable` (see state rules below). |
| `href` | string | Required when `status` is `live` | Must be an absolute `https://` URL or a root-relative path. Must not be empty. Forbidden for `preview` and `unavailable`. |
| `mockup` | string | Required when `status` is `preview` or `unavailable` | File name under `mockups/`, for example `notes.svg`. Optional for `unavailable`, which may use the neutral placeholder. |
| `mockupAlt` | string | No | Usually empty, because the name conveys the content. Set only when the mock-up carries information not in the text. |

**Status rules** (FR-004, FR-006, FR-008, edge cases):

- `live`: `href` required. The card links to the application. The `mockup` field is ignored for display but may be kept for a thumbnail.
- `preview`: `mockup` required. The card shows the mock-up labelled "Preview". Not activatable.
- `unavailable`: the card is shown but not activatable. If `mockup` is absent, the neutral placeholder is used.
- An entry that fails validation is excluded from the grid, and its id is logged with `console.warn`. A malformed entry must never break the page (FR-009 and Principle IV: failure contained).

**Validation** is a pure function, `validateEntry(entry) -> { valid: boolean, errors: string[] }`,
exported from `scripts/build-site.mjs` so it can be unit tested (see [quickstart.md](quickstart.md)).
Unlike a runtime check, an invalid entry is a **build error**: the build fails and names the entry, so bad data never reaches the published page. This replaces the earlier "exclude and warn" rule.

**Derived view state** (not stored):

- `chipLabel`: "Live", "Preview" or "Unavailable".
- `footerLabel`: "Open", "Coming soon" or "Unavailable".
- `isActivatable`: `status === "live"`.

## Relationships

- Front Page has zero or more Application Entries (ordered as listed; no sorting in v1, per spec assumptions).
- Application Entry references at most one mock-up file (by name, not by path).

## Storage

- Application entries live in `data/apps.json`. The build script `scripts/build-site.mjs` validates them and generates the cards into `site/index.html`. Nothing is fetched at runtime (constitution: no runtime data loading). A database is not used, because the hub must stay static (Principle IV).
- Mock-ups live in `site/mockups/`.
- No user data is stored, collected or sent (constitution: no analytics or personal data).

## State transition: application lifecycle

```
(not listed) -> preview -> live
                   |
                   +-> unavailable -> live   (when restored)
```

Moving from `preview` to `live` is a one-line edit: set `status: "live"`, add `href`, and remove the
need for `mockup` display. The card keeps its dimensions (FR-008).

## Example instance

```js
{
  id: "notes",
  name: "Notes",
  description: "Quick capture for ideas that are not ready to become tasks.",
  status: "preview",
  mockup: "notes.svg"
}
```
