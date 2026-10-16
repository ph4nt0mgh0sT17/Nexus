# Feature Specification: Mikrite Nexus Front Page

**Feature Branch**: `001-mikrite-nexus-front-page`
**Created**: 2026-10-15
**Status**: Done (2026-10-15). Implemented and merged for review; three verification tasks are still open and are listed in [tasks.md](tasks.md): T036 (1280 px layout), T037 (Lighthouse, contrast and keyboard audit), T046 (theme switch at 1280 px). Any gaps found there go into a new spec.
**Input**: User description: "Build a front page, let's call it Mikrite Nexus. It will contain the main title, a little description and boxes of applications it can lead to. Of course there will be nothing at the start so mock-up will be needed. The technical aspects of this specification will be discussed in planning phase."

## Overview

Mikrite Nexus is the front page of the platform. It introduces the product by name, explains in a few words what it is, and presents a set of boxes, each one a gateway to an application the platform can lead to. The applications behind the boxes are not built yet. Until they are, each box shows a mock-up of its application so visitors and stakeholders can see what the destination will be. The front page itself does not need a separate mock-up.

## Clarifications

### Session 2026-10-15

- Q: Should the page styling use plain CSS with custom properties, or Tailwind? → A: Plain CSS with custom properties (no CSS framework, no build step) *(superseded)*
- Q: Should the page styling use plain CSS with custom properties, or Tailwind? → A: Tailwind CSS v4 with daisyUI v5, compiled at build time into a static stylesheet. Owner decision; the constitution was amended to 1.1.0 to allow this build-time tooling. *(superseded by [002-static-app-cards](../002-static-app-cards/spec.md): plain CSS, no framework, no build step)*
- Q: How should stakeholders reach the front page to review the mock-ups before it is deployed? → A: Local review only. Reviewers run the built site on their own machine; no hosted review URL is required for this feature.
- Q: Should preview and unavailable boxes be reachable with the Tab key, even though they cannot be opened? → A: Yes. They are reachable and announced as disabled; activating them does nothing.
- Q: How many applications should the front page be designed to handle without the layout breaking? → A: Design for up to 50 applications. The first delivery is expected to list at most three. *(superseded by [002-static-app-cards](../002-static-app-cards/spec.md): design for up to five)*
- Q: Is it acceptable to use a placeholder logo and colour palette for the first review, with real brand assets added later? → A: Yes. The first review uses a placeholder mark and palette; brand values are swapped in later without a layout change.
- Q: What is the largest total download the front page may need before images, on first load? → A: 100 KB, the page-weight budget set by the constitution.
- Q: Must every application that is not built have a mock-up? → A: Every application with status preview must have one (FR-006). An unavailable application may show the neutral placeholder if it has no mock-up.
- Q: What happens when the application list is empty versus contains invalid entries? → A: An empty list shows the empty state (FR-005). An invalid entry fails the build and is named in the error; it is never silently excluded.
- Q: Do live cards need their own thumbnail? → A: Yes. Every card, preview or live, shows its own WebP thumbnail file. The mock-up remains the reviewable source for preview cards.
- Q: What must the footer show? → A: A copyright line "Copyright © {year} Mikrite", where the year is the year of the build, and the release version. Local builds show 0.0.0; the first release is 1.0.0.
- Q: Must links be verified before the page is shown? → A: No, not for this proof of concept. Entries are previews until real applications exist; link checks are added with the first live entry.
- Q: Should visitors be able to choose light or dark colours themselves? → A: Yes. A theme switch in the header offers Light and Dark. No option is selected by default, and the page then follows the device setting. It must work without JavaScript and is not remembered between visits. A System option is not offered.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand what Mikrite Nexus is (Priority: P1)

A first-time visitor lands on the front page and immediately sees the product name, a short description, and what they can do next.

**Why this priority**: Without a clear title and description the page has no purpose. This is the minimum viable front page.

**Independent Test**: Load the page with no applications configured. The title "Mikrite Nexus" and the description are visible above the fold on a desktop and on a phone-sized screen.

**Acceptance Scenarios**:

1. **Given** a visitor opens the front page, **When** the page finishes loading, **Then** the main title "Mikrite Nexus" is the most prominent text on the page.
2. **Given** a visitor opens the front page, **When** they read the page, **Then** a short description (one to two sentences) explains what Mikrite Nexus is.

---

### User Story 2 - Choose an application from the boxes (Priority: P2)

A visitor sees a grid of boxes, each representing an application. They choose one and are taken to it.

**Why this priority**: The boxes are the navigation hub of the front page. They are the reason the page exists beyond branding.

**Independent Test**: Configure at least two sample applications. Each box shows a name, a short description and an entry point. Selecting a box opens its application.

**Acceptance Scenarios**:

1. **Given** one or more applications are available, **When** the front page loads, **Then** one box is shown per application, each with a name and a short description.
2. **Given** a live box is visible, **When** the visitor activates it (click, tap, or keyboard), **Then** the visitor is taken to that application.
3. **Given** a box is visible, **When** the visitor hovers over or focuses it, **Then** the box shows a clear visual highlight.

---

### User Story 3 - Preview applications that are not built yet (Priority: P3)

The product owner and stakeholders need to judge the front page before the applications behind the boxes exist. Each box shows a mock-up of its application, so the page can be reviewed and approved with the real content in place.

**Why this priority**: The page is designed ahead of its destinations. Mock-ups of each application must be defined and reviewable now.

**Independent Test**: With applications listed but not built, each box shows a clearly labelled mock-up of its application. A stakeholder can review every box without opening a live application.

**Acceptance Scenarios**:

1. **Given** an application is listed but not built, **When** the front page loads, **Then** its box shows a mock-up of that application, labelled as a preview (for example "Preview - coming soon").
2. **Given** an application is built, **When** the front page loads, **Then** its box shows the live application entry instead of the mock-up.
3. **Given** no applications are listed, **When** the front page loads, **Then** the application area shows an empty state message (for example "No applications yet") instead of an empty grid.

---

### Edge Cases

- A large number of applications: the grid must remain usable with up to five applications (wrapping rows, no horizontal scrolling). *(revised from 50 by [002-static-app-cards](../002-static-app-cards/spec.md))*
- An application with a long name or description: text is truncated or wrapped without breaking the box layout.
- An application that is unavailable: its box is still shown, marked as unavailable, reachable by keyboard and announced as disabled, and cannot be activated.
- A browser that does not support the `:has()` selector: the theme switch has no effect, and the page follows the device setting.
- An unavailable application with no mock-up: its box shows a neutral placeholder marked as "Preview not available" rather than breaking the layout. A preview application always has a mock-up (FR-006).
- A visitor on a narrow phone screen: boxes stack in a single column with the same content.
- A visitor who uses only the keyboard or a screen reader: every box is reachable and announces its name.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The front page MUST display the main title "Mikrite Nexus".
- **FR-002**: The front page MUST display a short description of the product (one to two sentences).
- **FR-003**: The front page MUST display one box per listed application, each showing the application's name, a short description and its own thumbnail.
- **FR-004**: Each application box MUST lead the visitor to its application when activated, provided the application is built and available.
- **FR-005**: When no applications are listed, the front page MUST show a clear empty state in place of the application boxes.
- **FR-006**: Each application with status preview (not yet built) MUST have a mock-up that is shown in its box, clearly labelled as a preview.
- **FR-007**: Application mock-ups MUST be reviewable by stakeholders without any application being built or deployed. For this feature, review is done locally from the built site; a hosted review URL is not required.
- **FR-008**: When an application is built, its box MUST switch to the live application entry (its link becomes active) without a layout change.
- **FR-009**: The layout MUST work on desktop and phone-sized screens without horizontal scrolling.
- **FR-010**: Application boxes MUST be reachable by keyboard and expose their name to assistive technology. Live boxes MUST be activatable by keyboard. Preview and unavailable boxes MUST be announced as disabled and MUST do nothing when activated.
- **FR-011**: The list of applications MUST be easy to change, so adding or removing an application does not require redesigning the page. *(Revised by [002-static-app-cards](../002-static-app-cards/spec.md): the boxes are written directly in the front page HTML; there is no data file and no build step.)*
- **FR-012**: The front page MUST display a footer with the copyright notice "Copyright © {year} Mikrite", where the year is the year of the build.
- **FR-013**: The front page MUST display the release version in the footer. Local builds show 0.0.0; the first release is 1.0.0.
- **FR-014**: The front page MUST offer a theme switch in the header with two choices: Light and Dark. *(Superseded in part by [002-static-app-cards](../002-static-app-cards/spec.md) FR-013: Light is ticked by default, so the device setting no longer applies on first load.)* Until a choice is made, the page follows the visitor's device setting. Choosing Light or Dark overrides the device setting for the current page view.
- **FR-015**: The theme switch MUST work without client-side JavaScript and MUST NOT change the layout. Its choice is not stored between visits.

### Key Entities

- **Front Page**: The landing page of Mikrite Nexus. Attributes: title, description, list of application entries, empty-state message, footer (copyright notice and release version).
- **Application Entry**: An application the platform can lead to. Attributes: name, short description, destination, availability status, thumbnail (a WebP file, required for every application), mock-up (required while the application is in preview).

## Out of Scope

- Accounts, sign-in and personalisation.
- The content and behaviour of the applications the boxes lead to.
- Building the applications themselves; this spec only requires their mock-ups.
- Hosting, deployment and integration details. The technical stack is set in the plan; deployment is parked in [deployment-discussion.md](../../deployment-discussion.md).

## Assumptions

- The first delivery is the front page with mock-ups for each listed application; the applications themselves will be built later. The first delivery is expected to list at most three applications, while the design supports up to five. *(revised from 50 by [002-static-app-cards](../002-static-app-cards/spec.md))*
- Application boxes are shown in a single flat grid; no categories or ordering rules are required in this iteration.
- The description is written by the product owner and is not user-editable on the page.
- Visual styling uses Tailwind CSS v4 with daisyUI v5, compiled at build time into a static stylesheet, with no client-side JavaScript (see Clarifications). *(superseded by [002-static-app-cards](../002-static-app-cards/spec.md): one plain, hand-written CSS file with no framework and no build step)* Colours, typography and imagery are refined in the planning phase. The first review uses a placeholder logo mark and colour palette (see Clarifications).

- The first three entries are all status preview, with these names and descriptions: Tasks ("Plan, track and finish the work you have in hand."), Notes ("Quick capture for ideas that are not ready to become tasks.") and Archive ("Store finished and reference material so it stays easy to find.").
- Entries start as mock-ups and are switched to live later by adding a real `href`.
- During implementation, a WebP thumbnail is produced for each of the first three entries (Tasks, Notes and Archive). Claude generates them, or the owner supplies replacements. Each thumbnail is a 1280×800 WebP image, and no existing screenshot of an unbuilt application is used. Each application is created as a mock-up first, so no application needs to exist for the page to be reviewed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can state what Mikrite Nexus is within 10 seconds of the page loading.
- **SC-002**: The title, description and application area are fully visible without scrolling on a common desktop screen and a common phone screen.
- **SC-003**: Stakeholders can review every application's mock-up on the front page with no application built.
- **SC-004**: Every application box can be reached using only the keyboard; every live box can be activated with the keyboard, and every preview or unavailable box is announced as disabled.
- **SC-005**: Adding an application entry requires no change to the page layout, up to five applications. *(revised from 50 by [002-static-app-cards](../002-static-app-cards/spec.md))*
- **SC-006**: On first load, the page transfers no more than 100 KB before images, measured compressed (gzip or brotli).

## Open Questions for Planning

Resolved in [plan.md](plan.md) and [research.md](research.md): the technology stack, where entries are stored (originally `data/apps.json`; now written directly in the front page HTML, per [002-static-app-cards](../002-static-app-cards/spec.md)), and the mock-up format (hand-authored SVG).

Still open:

- Brand assets (logo, colour palette) to replace the placeholders once they are provided.
