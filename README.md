# Nexus

Nexus is the main entry point to my ecosystem of applications. It is a lightweight hub page that gives one place to find and launch every app, rather than a tool with features of its own.

The hub is a static page. It is generated at build time from one list of applications, and it ships no client-side JavaScript. There is no backend and no runtime data fetching.

## Purpose

- Provide a single landing page for all related applications.
- Give each app a consistent card with a name, short description, and link.
- Stay easy to maintain: adding or removing an app means editing one list, `data/apps.json`.

## Tech stack

- **HTML5** for structure
- **Tailwind CSS v4 with daisyUI v5**, compiled at build time into one static stylesheet. These are the only build-time tools, pinned to exact versions.
- **Node.js 20 or later** for the build only. The served site needs no Node.
- No client-side JavaScript, frameworks, or runtime dependencies.

The choice of Tailwind and daisyUI is recorded in [specs/001-mikrite-nexus-front-page/tech-stack-decisions.md](specs/001-mikrite-nexus-front-page/tech-stack-decisions.md).

## Project structure

```
Nexus/
├── data/apps.json            # The application list (the only file to edit to add an app)
├── src/
│   ├── index.template.html   # Page template
│   └── input.css             # Tailwind and daisyUI source
├── scripts/build-site.mjs    # Validates data/apps.json and generates site/
├── site/                     # The built site (see below)
├── deploy/nginx/             # nginx server block and security headers snippet
├── tests/                    # Build tests
├── specs/                    # Feature specifications and plans
├── .specify/                 # Project constitution and spec-driven templates
├── DEPLOYMENT.md             # How the site is released and deployed
├── SECURITY.md               # Security policy and rules for secrets
└── README.md
```

In `site/`, the generated files `index.html` and `style.css` are not committed. The thumbnails and mockups are source assets and are committed.

## Running locally

You need Node.js 20 or later (LTS) from nodejs.org, which includes npm. Check with `node -v` and `npm -v`.

1. Install the build tools once, from the repository root:

   ```bash
   npm install
   ```

2. Build the site:

   ```bash
   npm run build
   ```

3. Serve the `site/` folder with any static server. Opening `site/index.html` directly from disk does not load the stylesheet reliably, so use a server. For example:

   ```bash
   npx http-server site -p 8080
   ```

   Then visit `http://localhost:8080`.

To rebuild automatically while you edit `data/apps.json`, `src/` or `scripts/`, run `npm run dev` instead of step 2 and keep it running.

Docker is optional. It is only a way to test the production nginx config locally. See "Testing in Docker" in [DEPLOYMENT.md](DEPLOYMENT.md).

## Adding an application

Applications are listed in `data/apps.json`. Add one object with the fields in the table below, then run `npm run build`. The build checks each entry and names the entry `id` and the broken field if something is wrong.

A `live` entry must link to a working address. Check it before each release, as described in [DEPLOYMENT.md](DEPLOYMENT.md).

Guidelines:

- Keep descriptions to one sentence.
- Use `preview` for an app that is planned, with a labelled mock-up instead of a link.
- Link to each app's own URL. The hub should not duplicate app logic.

## Design principles

- **Fast:** no external requests are needed to render the page.
- **Accessible:** semantic HTML, keyboard-navigable links, WCAG 2.2 AA contrast, visible focus, and respect for `prefers-reduced-motion`.
- **Responsive:** the app grid adapts from one column on phones to several on desktop.
- **Themeable:** colors and spacing are defined as CSS custom properties, with light and dark variants via `prefers-color-scheme`.

The full rules are in the constitution at [.specify/memory/constitution.md](.specify/memory/constitution.md).

## Deployment

The hub is static and is served by nginx on a Debian 13 VPS. Releases are built on the development machine and published as tarballs on GitHub Releases. The server downloads and extracts them by hand. There is no CI/CD for now.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full process, and [SECURITY.md](SECURITY.md) for how to report a vulnerability.

## Roadmap

- [x] Front page with the app grid, light and dark themes, and the build pipeline (spec 001)
- [ ] Choose and register a domain
- [ ] Set up the VPS and deploy the first release
- [ ] Enable HTTPS
- [ ] Put the first application live (the first app is currently a `preview`)

## Contributing

This is a personal project. Make each change on a branch, and merge it into `main` through a pull request. Before merging, check the change at phone width (375px) and desktop width (1280px), in light and dark color schemes. The constitution in `.specify/memory/constitution.md` sets the rules for review.

Never commit secrets, tokens or keys. The repository is public. See [SECURITY.md](SECURITY.md).

## License

To be decided.

## Application entry contract

Applications are listed in `data/apps.json`. The build (`npm run build`) validates the list and generates `site/index.html`. An invalid entry fails the build and names the entry `id` and the broken field.

Field rules:

| Field | Rule |
|---|---|
| `id` | Matches `^[a-z][a-z0-9-]{1,39}$`. Unique across the array. |
| `name` | Trimmed length 1-40. |
| `description` | Trimmed length 1-160. |
| `status` | One of `live`, `preview`, `unavailable`. |
| `href` | Only for `live`. Absolute `https://` URL, or a root-relative path beginning with `/`. Never `javascript:` or `data:`. |
| `mockup` | Required for `preview`; optional for `unavailable`; not used for `live`. A file name in `site/mockups/`, matching `^[a-z0-9][a-z0-9.-]*\.svg$`. |
| `thumbnail` | Required for every status. A file name in `site/thumbnails/`, matching `^[a-z0-9][a-z0-9.-]*\.webp$`. WebP, 16:10, exported at 1280×800 pixels. |
| `mockupAlt` | Optional string. |

Fields not listed are ignored. An empty array (`[]`) is valid and shows "No applications yet".

## Commands

```bash
npm run build                          # generate site/style.css and site/index.html
npm run dev                            # rebuild on change while editing
node --test tests/build-site.test.mjs  # run the build tests
```

Node.js 20 or later is needed for these commands. The served `site/` folder needs no Node.
