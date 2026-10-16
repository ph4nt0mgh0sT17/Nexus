<!--
Sync Impact Report
- Version change: 1.1.0 -> 2.0.0 (MAJOR: a core technology constraint is dropped)
- Sections amended: Principle III (Maintainability, styling source line), Principle V
  (Architectural Simplicity, build-tool exception removed), Technology and Quality Constraints
  (styling technology), Governance (version line)
- Rationale: Spec 002-static-app-cards removed the build step for the front page. The page's
  markup is hand-written in site/index.html, so the only remaining build step was the Tailwind
  stylesheet. The owner decided to drop Tailwind CSS v4 and daisyUI v5 and use one plain,
  hand-written CSS file committed with the site. This reverses the 1.1.0 styling approval.
- Impact on existing applications: None. No application exists yet.
- Impact on templates under .specify/: The plan template's Constitution Check and any
  reference to the Tailwind build step must be updated. Not changed by this amendment.
- Deferred, not changed here (conflict with spec 002): Principle IV still requires the app list
  to be data, not markup, and to scale to 50 applications. Technology and Quality Constraints
  still requires application data compiled from a source file. Spec 002 moves the boxes into
  the HTML and limits the design to five. A separate amendment is needed for these points.
- Approval: Repository owner.
-->

# Nexus Constitution

Nexus is the static hub that leads to the rest of the ecosystem of applications. The hub is
deliberately small. Its long-term value depends on the quality, testability, and independence
of the applications it links to, so these principles set the bar for both the hub and every
application that joins the ecosystem.

## Core Principles

### I. Code Quality

Code MUST be written for the next reader. Every change MUST be readable without the author
present.

- Names MUST describe purpose. Abbreviations are allowed only when they are standard in the
  domain (for example, `url` or `css`).
- Functions MUST do one thing. A function that needs a comment to explain its sections SHOULD
  be split.
- Dead code, commented-out code, and unused dependencies MUST NOT be merged.
- Warnings from the linter, HTML validator, and CSS validator MUST be resolved or explicitly
  suppressed with a reason in the same line.
- Rationale: Quality problems compound. A hub that is hard to read becomes hard to change, and
  a hub that is hard to change accumulates workarounds.

### II. Testing

Behavior MUST be verified before it is considered done, and verification MUST be repeatable.

- Logic that transforms data (for example, validating an app entry or filtering the app list)
  MUST have automated tests that run without a browser when possible.
- Every user-visible change to the hub MUST be checked at phone width (375px) and desktop width
  (1280px) in at least one light and one dark color scheme before merge.
- Every app link MUST be verified to resolve before a release. A broken link is a defect.
- Accessibility checks (keyboard navigation, focus visibility, color contrast) MUST pass for
  any change that touches markup or styles.
- A bug fix MUST include a test or a documented manual check that fails before the fix and
  passes after it.
- Rationale: The hub is the first thing a user sees. Regressions there affect every app.

### III. Maintainability

The codebase MUST remain easy to change by someone who did not write it.

- Each concern MUST live in one place: markup in `site/index.html`, styling in
  `site/style.css` (one hand-written stylesheet), application data in `data/`, and behavior in
  `js/` only when a requirement cannot be met statically. Duplicating a value across files is a
  defect.
- Visual values (colors, spacing, font sizes) MUST be defined as CSS custom properties and
  referenced by name.
- Dependencies MUST be avoided by default. A new dependency MUST be justified in the pull
  request with the problem it solves and the cost it adds.
- Public contracts, such as the app entry format, MUST be documented in the README before they
  are relied on by a second app.
- Breaking changes to a contract MUST be called out in the pull request and reflected in the
  README's documented contract.
- Rationale: A hub with no build step and few dependencies is only maintainable if its
  conventions are explicit and kept.

### IV. Scalability

The hub MUST support growth in the number of applications without structural rewrites.

- The app list MUST be data, not markup. Adding an application MUST NOT require changing layout
  or styling code.
- The hub MUST remain static and MUST NOT depend on a server to render its core content.
  This keeps it cheap, fast, and independent of any one application's availability.
- Each application MUST own its own runtime, data, and deployment. The hub MUST NOT import or
  execute application code, and MUST NOT depend on another application being online to render.
- The page MUST stay usable with a list of at least 50 applications: the grid MUST remain
  responsive, and search or filtering (when present) MUST respond without a noticeable delay.
- Performance budgets SHOULD be set and checked: the hub SHOULD load its critical content with
  no more than one stylesheet and one script, and total transfer SHOULD stay under 100 KB before
  images.
- Rationale: The ecosystem will outgrow a hand-maintained page. The structure has to make adding
  an application cheap and make an application's failure contained.

### V. Architectural Simplicity

The simplest architecture that meets the current requirements MUST be preferred. Complexity
MUST be justified by a present need, not an anticipated one.

- A new layer (framework, build tool, state store, router) MUST NOT be introduced until a
  requirement cannot be met by the existing plain HTML, CSS, and JavaScript. No build-time tool
  is approved for the hub; any build step requires an amendment to this constitution.
- Module boundaries MUST follow the ecosystem's real seams: the hub knows an application's
  name, description, link, and status, and nothing else.
- Shared behavior between applications MUST be introduced only after it exists in at least
  two applications and has a clear owner.
- Rationale: An architecture for an ecosystem that does not yet exist is a cost, not a
  foundation. Simplicity keeps the hub stable while the applications around it change.

## Technology and Quality Constraints

- The hub MUST be built with HTML5 and CSS3. Styling MUST be one plain, hand-written CSS file
  committed with the site. No CSS framework, preprocessor, or build-time styling tool is
  approved, and the served page MUST NOT load any CSS framework from a CDN.
- Vanilla JavaScript MAY be added only where a requirement cannot be met statically, with a
  recorded reason. The hub currently ships no client-side JavaScript. Any other technology
  requires an amendment to this section.
- Application data (the app list) MUST live in a source file that is compiled into the static
  output at build time. The served page MUST NOT fetch application data at runtime.
- The hub MUST work in the current stable release and the previous major release of Chrome,
  Edge, Firefox, and Safari.
- The hub MUST be keyboard-operable and meet WCAG 2.2 AA for contrast and focus visibility.
- The hub MUST respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Secrets, tokens, and personal data MUST NOT be committed to the repository, and the hub MUST
  NOT collect analytics or personal data without an explicit amendment to this constitution.
- Third-party scripts and stylesheets MUST NOT be loaded from the page without a recorded
  reason and a pinned version.

## Development Workflow and Quality Gates

- All changes MUST be made on a branch and merged through a pull request into `main`.
- A pull request MUST NOT be merged unless it:
  1. Describes what changed, why, and any known risks.
  2. Passes the testing requirements in Principle II.
  3. Satisfies the maintainability requirements in Principle III.
  4. Does not add a dependency or layer without the justification required by Principles III
     and V.
- Reviewers MUST check each pull request against the five core principles. A review comment
  that cites a principle is a valid reason to request changes.
- Hotfixes MAY skip step 2 only when they restore a broken, shipped state. The skipped checks
  MUST be completed in a follow-up pull request before the next release.

## Governance

This constitution supersedes other practices in this repository. Where a README, template,
or comment conflicts with it, this constitution prevails.

**Amendments** require:

1. A pull request that changes this file and includes a Sync Impact Report.
2. A written rationale for the change, including the principle or section affected.
3. An assessment of impact on existing applications and on the templates under `.specify/`.
4. Approval from the repository owner.

**Versioning policy** follows semantic versioning:

- MAJOR: a principle is removed or redefined in a way that makes previously compliant work
  non-compliant, or a core technology constraint is dropped.
- MINOR: a principle or section is added, or existing guidance is materially expanded.
- PATCH: wording, clarification, typo fixes, or non-semantic refinement.

**Compliance review**: Every pull request review MUST confirm compliance with the core
principles. Periodic reviews (at least once per quarter) SHOULD check that the hub still meets
the performance budget and that all listed applications resolve.

**Version**: 2.0.0 | **Ratified**: 2026-10-15 | **Last Amended**: 2026-10-16
