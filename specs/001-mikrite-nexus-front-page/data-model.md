# Data Model: Mikrite Nexus Front Page

**Date**: 2026-10-15 | **Plan**: [plan.md](plan.md) | **Contract**: [contracts/app-entry.md](contracts/app-entry.md)

> **Superseded in part by [002-static-app-cards](../002-static-app-cards/spec.md) (2026-10-16).** Application entries are no longer read from `data/apps.json`. Each box is written in the front page HTML, and the design supports up to five. The `apps` source row and the storage note below are historical.

## Entities

### Front Page (singleton, not stored)

The page itself has no stored record. It is composed from static markup and the application list.

| Field | Source | Notes |
|---|---|---|
| `title` | `index.html` | Fixed: "Mikrite Nexus" (FR-001) |
| `description` | `index.html` | One to two sentences (FR-002) |
| `apps` | `data/apps.json` | Zero or more Application Entries, read at build time |
| `emptyMessage` | `index.html` | Shown when `data/apps.json` contains no entries (FR-005) |
| `footer` | `index.html` | "Copyright © {year} Mikrite" (FR-012). `year` is the build year. |
| `version` | `package.json` | Release version shown as "v{version}" (FR-013). Local builds use `0.0.0`; the first release is `1.0.0`. |
| `themeChoice` | Browser, per page view | Unset (default, follows the device setting), `light` or `dark` (FR-014). Set by the header radio group. Not stored in the file or the browser, so it resets on every page load (FR-015). |

### Application Entry

One object per application in the `APPS` array.

| Field | Type | Required | Rules |
|---|---|---|---|
| `id` | string | Yes | Lowercase slug: `^[a-z][a-z0-9-]{1,39}$`. Unique in the list. Used for the mock-up file name and the DOM id. |
| `name` | string | Yes | 1-40 characters after trimming. Long names wrap; they are not truncated (spec edge case). |
| `description` | string | Yes | 1-160 characters after trimming. Clamped visually to 3 lines in the card; the full text stays in the DOM for screen readers. No `title` attribute is used. |
| `status` | enum | Yes | `live`, `preview` or `unavailable` (see state rules below). |
| `href` | string | Required when `status` is `live` | Must be an absolute `https://` URL or a root-relative path. Must not be empty. Forbidden for `preview` and `unavailable`. |
| `mockup` | string | Required when `status` is `preview`; optional for `unavailable`; not used for `live` | File name under `mockups/`, for example `notes.svg`. An `unavailable` entry without one uses the neutral placeholder. |
| `thumbnail` | string | Required for every status | File name under `thumbnails/`, for example `notes.webp`. Shown in the same 16:10 card area as the mock-up. |
| `mockupAlt` | string | No | Usually empty, because the name conveys the content. Set only when the mock-up carries information not in the text. |

**Status rules** (FR-004, FR-006, FR-008, edge cases):

- `live`: `href` required. The card links to the application and shows its thumbnail. The `mockup` field is not used.
- `preview`: `mockup` required. The card shows the mock-up labelled "Preview". Not activatable.
- `unavailable`: the card is shown but not activatable. If `mockup` is absent, the neutral placeholder is used.
**Validation** is a pure function, `validateEntry(entry) -> { valid: boolean, errors: string[] }`,
exported from `scripts/build-site.mjs` so it can be unit tested (see [quickstart.md](quickstart.md)).
An entry that fails validation is a **build error**: the build fails and names the entry id and the broken field, so bad data never reaches the published page. Invalid entries are never excluded silently at build or run time. The page itself has no runtime validation, because it ships no JavaScript.

**Derived view state** (not stored):

- `chipLabel`: "Live", "Preview" or "Unavailable".
- `footerLabel`: "Open", "Coming soon" or "Unavailable".
- `isActivatable`: `status === "live"`.

## Relationships

- Front Page has zero or more Application Entries (ordered as listed; no sorting in v1, per spec assumptions).
- Application Entry references at most one mock-up file (by name, not by path).

## Storage

- Application entries live in `data/apps.json`. The build script `scripts/build-site.mjs` validates them and generates the cards into `site/index.html`. Nothing is fetched at runtime (constitution: no runtime data loading). A database is not used, because the hub must stay static (Principle IV).
- Mock-ups live in `site/mockups/`. Live thumbnails live in `site/thumbnails/`.
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
