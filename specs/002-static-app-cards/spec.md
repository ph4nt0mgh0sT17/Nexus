# Feature Specification: Static Application Cards

**Feature Branch**: `002-static-app-cards`
**Created**: 2026-10-16
**Status**: Draft
**Input**: User description: "Change the way how applications are rendered. I now want to get rid of the applications JSON and want it to be statically in the HTML. It will now be editable by admin on the fly. All other specs will need to be changed as well because We don't want to support up to 50 applications but just a few."
**Supersedes**: the application-list parts of [001-mikrite-nexus-front-page](../001-mikrite-nexus-front-page/spec.md) (data file, build-time generation, and the 50-application design target). All other behaviour of 001 is unchanged.

## Overview

The front page lists its applications as boxes. Today the list lives in a JSON data file that a build step turns into HTML. This feature removes that file and the generation step. Each application box is written directly in the front page HTML, so the page is a plain static file. An admin changes the boxes by editing that HTML: adding, changing, reordering or removing a box is visible on the next page load, with no build run.

The design target is now a few applications, not 50. The page must look right with zero to five boxes.

## Clarifications

### Session 2026-10-16

- Q: What does "editable by admin on the fly" mean for a static page? → A: The admin edits the boxes in the front page HTML file and the change is live on the next load. No build, no code generation and no admin screen. *(Working assumption, see Assumptions; an admin screen with sign-in would need a server and is out of scope.)*
- Q: How many applications must the design support? → A: Up to five. Any number from zero to five must fit the layout without horizontal scrolling. Designs for more than five are no longer required.
- Q: Should a box keep the "unavailable" status from 001? → A: Yes. A box has one of three statuses: live, preview or unavailable, as in 001.
- Q: Who updates the footer's copyright year and release version when the admin edits the HTML by hand? → A: The admin sets both by hand as part of each edit. No script and no build step sets them. The year is the year of the edit, which is the build year for this page.
- Q: Which file is the source of the front page: the committed `site/index.html`, or a separate template? → A: `site/index.html` is the only source. It is committed and edited by hand. The template `src/index.template.html` and the generator that filled it are removed, since nothing is generated for the page's markup any more.
- Q: Should the styling keep Tailwind CSS and daisyUI, which needed a build step? → A: No. Tailwind and daisyUI are dropped. The styling is one plain CSS file, committed with the site. This supersedes the Tailwind decision recorded in 001 (Clarifications and Assumptions). The constitution's technology constraint, which requires Tailwind v4 and daisyUI v5 at build time, must be amended before this change is planned.
- Q: Who checks that live links resolve before a release, now that there is no data file? → A: Nobody for now. Link checks are added with the first live entry, as 001 already states. The release-check rule in `deployment-discussion.md` (point 8) must be updated to match when that happens.
- Q: Which theme should the switch show by default? → A: Light. The Light option is ticked on first load, so the page no longer follows the visitor's device setting until a choice is made. This supersedes the device-setting default in 001 FR-014. *(Recorded after implementation; see FR-013.)*
- Q: Where does the admin checklist live, given FR-008 says "kept with the front page"? → A: In `ADMIN.md` at the repository root, next to the page, not served. Choosing the root keeps it out of the served `site/` folder with no extra server rules. *(Recorded from analysis gap G6.)*
- Q: Should a live box open its application in the same tab or in a new tab? → A: The same tab, like any normal link. A visitor returns to the front page with the browser's back button.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin edits an application box directly (Priority: P1)

An admin opens the front page file, changes the name, description, status or thumbnail of one box, saves it and reloads the page. The change is visible without running any tool.

**Why this priority**: This is the reason for the change. If an edit still needs a build or a data file, the goal is not met.

**Independent Test**: Edit the description of one box in the front page HTML, save, reload the page in a browser. The new description appears. No other file was changed.

**Acceptance Scenarios**:

1. **Given** the front page HTML contains a box, **When** the admin changes its name or description and reloads, **Then** the new text is shown in that box and nowhere else changes.
2. **Given** the admin wants a new application, **When** they copy an existing box in the HTML, change its content and save, **Then** the new box appears after the others on the next load, with no other file edited.
3. **Given** the admin wants to remove an application, **When** they delete its box from the HTML and save, **Then** the box disappears on the next load and the remaining boxes keep their layout.
4. **Given** the admin changes the order of boxes in the HTML, **When** they reload, **Then** the boxes appear in that order.

---

### User Story 2 - Visitor sees up to five applications (Priority: P2)

A visitor sees the applications as a grid of boxes. Each box shows its name, a short description and its thumbnail, and it behaves as it does in 001 (live boxes are activatable, preview boxes are announced as disabled).

**Why this priority**: The boxes are the navigation of the page. They must work for the realistic range of one to five applications.

**Independent Test**: With five boxes in the HTML, load the page on a desktop-width and a phone-width screen. All five are visible, in order, with no horizontal scrolling.

**Acceptance Scenarios**:

1. **Given** between one and five boxes are in the HTML, **When** the page loads, **Then** one box is shown per entry, in HTML order, each with name, description and thumbnail.
2. **Given** five boxes are in the HTML, **When** the page is shown at a desktop width and at a phone width, **Then** all five are visible, the grid wraps, and there is no horizontal scrolling.
3. **Given** a box is live, **When** the visitor activates it with a click, touch or the keyboard, **Then** the visitor is taken to its destination.

---

### User Story 3 - Preview and empty states (Priority: P3)

An application that is not built yet shows a labelled mock-up instead of a live link. When no boxes are in the HTML, the page shows the empty state.

**Why this priority**: Preview and empty states keep the page reviewable before any application exists.

**Independent Test**: Set every box to status preview, load the page, and confirm each shows its mock-up with a preview label. Remove all boxes, load the page, and confirm the empty state appears.

**Acceptance Scenarios**:

1. **Given** a box has status preview, **When** the page loads, **Then** the box shows its mock-up, labelled as a preview.
2. **Given** no boxes are in the HTML, **When** the page loads, **Then** the application area shows the empty state "No applications yet" instead of an empty grid.

---

### Edge Cases

- A box is missing its thumbnail or mock-up: the box still shows its name and description and keeps the grid layout; the missing image is shown as the neutral placeholder.
- A box has a very long name or description: the text wraps or is truncated without breaking the box or the grid.
- An admin introduces a typo in a box's markup: the rest of the page still renders; only that box may look wrong. Nothing is excluded silently, so the mistake is visible on the page and in the admin checklist (see FR-008).
- Exactly one box: it is shown in the grid at the same width rules as five boxes, not stretched across the page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application boxes MUST be written directly in the front page HTML, which is the only source of the page's markup. The separate application data file, the page template, and the build step that generated the boxes MUST be removed.
- **FR-002**: An admin MUST be able to add, change, reorder and remove a box by editing only the front page HTML. The change MUST be visible on the next page load without running a build or any other tool.
- **FR-003**: The page MUST support zero to five boxes. The layout MUST work for every count in that range without horizontal scrolling on desktop and phone-sized screens.
- **FR-004**: Each box MUST show the application's name, a short description and its own thumbnail.
- **FR-005**: When no boxes are in the HTML, the page MUST show the empty state "No applications yet" in place of the grid.
- **FR-006**: Each box with status preview MUST show its mock-up, clearly labelled as a preview. A box with status live MUST link to its application in the same tab and show its live entry instead of the mock-up. A box with status unavailable MUST show that it is unavailable, MUST NOT link, and MUST NOT be activatable.
- **FR-007**: Boxes MUST keep the accessibility behaviour from 001: reachable by keyboard, exposing their name, live boxes activatable, preview and unavailable boxes announced as disabled and inert.
- **FR-008**: The admin MUST have a short checklist, kept with the front page, of what every box needs (name, description, status, thumbnail, mock-up or link) and how to check the page after an edit. The checklist is the only validation step; no tool checks the HTML automatically in this feature.
- **FR-009**: The page MUST contain no client-side script for rendering the boxes. The boxes are plain HTML.
- **FR-010**: Editing the boxes MUST NOT change the title, description, theme switch, footer or page-weight behaviour defined in 001 (FR-001, FR-002, FR-012 to FR-015 of 001).
- **FR-011**: Application entries MUST NOT be stored in a JSON file, and no requirement in this feature depends on one.
- **FR-013**: The theme switch MUST have Light ticked by default. Choosing Dark overrides it for the page view. This supersedes the device-setting default in 001 FR-014.
- **FR-012**: The page's styling MUST be one plain CSS file, committed with the site. No CSS framework, preprocessor or build step is used for the page, and no change to the content of a box requires any build.

### Key Entities

- **Application Box**: One gateway on the front page. Written as a block of HTML inside the application area. Attributes: name, short description, status (live, preview or unavailable), thumbnail, mock-up (for preview) or destination (for live).
- **Admin Checklist**: The short list kept with the front page that states the parts every box needs and the post-edit check.

## Out of Scope

- An admin screen, login or any server-side editing. The page stays static.
- Automatic validation of the HTML, or a build step that checks boxes.
- Checking that live links resolve before a release. Deferred until the first live entry is added (see Clarifications).
- Support for more than five applications. Adding a sixth is possible by copying a box, but the layout is not tested or designed for it.
- Changing the content, mock-ups or thumbnails of the applications themselves.
- Hosting and deployment (parked in [deployment-discussion.md](../../deployment-discussion.md)).

## Assumptions

- "Editable by admin on the fly" means the admin edits the front page HTML file and the change is live on the next load. An admin with access to the file, on the server or in the repository, is the only editor. No user accounts are introduced.
- The "few applications" limit is five. The first delivery lists three (Tasks, Notes, Archive), as in 001.
- With no build step, the admin sets the footer's copyright year and release version by hand on each edit (see Clarifications). The values themselves are unchanged from 001.
- Thumbnails and mock-ups remain WebP and SVG files stored with the site; the HTML references them by path.
- The styling is one plain CSS file, `site/style.css`, written by hand and committed with the site. No CSS framework and no build step are used (see Clarifications and FR-012).
- The performance budget of 100 KB before images (001, SC-006) still applies. Five boxes add little weight.
- Existing 001 documents are updated where they describe the JSON file, the build-time generator or the 50-application target. Their history is kept.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can add, change or remove one application box in under five minutes, by editing only the front page HTML.
- **SC-002**: After an edit, the change is visible on a page reload with no build or other command run.
- **SC-003**: With five boxes, every box is visible without horizontal scrolling at a 375 px phone width and a 1280 px desktop width.
- **SC-004**: With zero boxes, the empty state appears and no empty grid is shown.
- **SC-005**: Every box can be reached and, if live, activated with only the keyboard; every preview box is announced as disabled.
- **SC-006**: The page transfers no more than 100 KB before images, measured compressed.
- **SC-007**: The front page contains no reference to a data file for the applications, and no script renders the boxes.

## Open Questions for Planning

- How the admin's HTML is kept consistent across the page's markup and the box markup (for example, a repeated block to copy). Decided in the plan.
- Footer year and version: decided, edited by hand (see Clarifications).
