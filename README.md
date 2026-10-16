# Nexus

Nexus is the main entry point to my ecosystem of applications. It is a lightweight hub page that gives one place to find and launch every app, rather than a tool with features of its own.

The hub is a static page: one hand-written HTML file and one hand-written CSS file. It ships no client-side JavaScript, has no build step, and has no backend or runtime data fetching.

## Purpose

- Provide a single landing page for all related applications.
- Give each app a consistent box with a name, short description, and link.
- Stay easy to maintain: adding or removing an app means editing one box in `site/index.html`.

## Tech stack

- **HTML5** for structure
- **CSS3** in one hand-written stylesheet, `site/style.css`. No framework and no build step.
- No client-side JavaScript, frameworks, build tools, or runtime dependencies.
- **nginx** serves the site in production. **Docker** is optional, for checking the production nginx config before a release.

## Project structure

```
Nexus/
├── site/                        # The site (the only folder served)
│   ├── index.html               # The page: header, title, theme switch, application boxes, footer
│   ├── style.css                # The one stylesheet
│   ├── mockups/                 # One SVG mock-up per preview application
│   └── thumbnails/              # One 1280×800 WebP thumbnail per application
├── deploy/nginx/                # nginx server block and security headers snippet
├── specs/                       # Feature specifications and plans
├── .specify/                    # Project constitution and spec-driven templates
├── ADMIN.md                     # Guide for editing the application boxes (not served)
├── DEPLOYMENT.md                # How the site is released and deployed
├── SECURITY.md                  # Security policy and rules for secrets
└── README.md
```

## Running locally

1. Open `site/index.html` directly in a browser. No install, server or build step is needed.
2. Edit the file, save, and reload the browser to see the change.

Before a release, check the site under the production nginx config with Docker, as described in [specs/002-static-app-cards/quickstart.md](specs/002-static-app-cards/quickstart.md) §9.

## Adding an application

Applications are boxes written directly in `site/index.html`. To add one, copy an existing box, change its fields as described in [the box markup contract](specs/002-static-app-cards/contracts/box-markup.md), and reload the page. No build is needed. Nothing checks the fields automatically, so follow the checklist in [ADMIN.md](ADMIN.md).

A `live` box must link to a working address. Check it before each release, as described in [DEPLOYMENT.md](DEPLOYMENT.md). The link check is deferred until the first live box exists.

Guidelines:

- Keep descriptions to one or two sentences.
- Use the preview status for an app that is planned, with a labelled mock-up instead of a link.
- Link to each app's own URL. The hub should not duplicate app logic.
- The page is designed for up to five applications.

## Design principles

- **Fast:** no external requests are needed to render the page, and it stays under 100 KB before images.
- **Accessible:** semantic HTML, keyboard-navigable boxes, WCAG 2.2 AA contrast, visible focus, and respect for `prefers-reduced-motion`.
- **Responsive:** the grid wraps from one column on phones to several on desktop, with no horizontal scrolling.
- **Themeable:** colours and spacing are CSS custom properties, with light and dark variants. A theme switch in the header lets visitors choose Light or Dark.

The full rules are in the constitution at [.specify/memory/constitution.md](.specify/memory/constitution.md).

## Deployment

The hub is static and is served by nginx on a Debian 13 VPS. Releases are packaged from the `site/` folder on the development machine and published as tarballs on GitHub Releases. The server downloads and extracts them by hand. There is no CI/CD for now.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full process, and [SECURITY.md](SECURITY.md) for how to report a vulnerability.

## Roadmap

- [x] Front page with the application boxes, light and dark themes, and no build step (specs 001 and 002)
- [ ] Choose and register a domain
- [ ] Set up the VPS and deploy the first release
- [ ] Enable HTTPS
- [ ] Put the first application live (the first app is currently a `preview`)

## Contributing

This is a personal project. Make each change on a branch, and merge it into `main` through a pull request. Before merging, check the change at phone width (375px) and desktop width (1280px), in light and dark colour schemes. The constitution in `.specify/memory/constitution.md` sets the rules for review.

Never commit secrets, tokens or keys. The repository is public. See [SECURITY.md](SECURITY.md).

## License

To be decided.

## Application box contract

The application boxes are HTML in `site/index.html`. The full markup contract is in [specs/002-static-app-cards/contracts/box-markup.md](specs/002-static-app-cards/contracts/box-markup.md). In short:

| Part | Rule |
|---|---|
| Status | One class on the `<li>`: `app--live`, `app--preview` or `app--unavailable`. |
| Name and description | An `<h3 class="app__name">` and a `<p class="app__text">`, in plain text. |
| Thumbnail | Required for every status: a 1280 × 800 WebP in `site/thumbnails/`. |
| Mock-up | Required for preview only: an SVG in `site/mockups/`. |
| Link | Live only: one `<a class="app__link">` with an `https://` or root-relative `href`. |
| Count | Zero to five boxes. Zero boxes shows "No applications yet". |

Nothing validates these rules automatically; check them after each edit using [ADMIN.md](ADMIN.md).

## Commands

None. The site has no build step. Open `site/index.html` in a browser to preview it.
