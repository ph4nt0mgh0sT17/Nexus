# Nexus

Nexus is the main entry point to my ecosystem of applications. It is a lightweight hub page that gives one place to find and launch every app, rather than a tool with features of its own.

The hub is intentionally simple: plain HTML and CSS, with a small amount of JavaScript only where it adds real value (for example, filtering or searching the app list). There is no build step, no framework, and no backend.

## Purpose

- Provide a single landing page for all related applications.
- Give each app a consistent card with a name, short description, and link.
- Stay easy to maintain: adding or removing an app is a matter of editing one list.

## Tech stack

- **HTML5** for structure
- **CSS3** for layout and theming (custom properties, CSS Grid/Flexbox, responsive design)
- **Vanilla JavaScript** (optional) for small enhancements such as search or filtering
- No dependencies, bundlers, or package managers required

## Project structure

The project is planned to grow into roughly this layout:

```
Nexus/
├── index.html      # Hub page: header, app grid, footer
├── css/
│   └── styles.css  # All styling, theme variables, responsive rules
├── js/
│   └── apps.js     # Optional: app list data and small UI behavior
├── README.md
└── .specify/       # Spec-driven development templates (not part of the site)
```

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

3. Serve the `site/` folder with any static server. Opening `site/index.html` directly from disk does not load the stylesheet reliably, so use a server. For example, with Node:

   ```bash
   npx http-server site -p 8080
   ```

   Then visit `http://localhost:8080`.

To rebuild automatically while you edit `data/apps.json`, `src/` or `scripts/`, run `npm run dev` instead of step 2 and keep it running.

Docker is optional. It is only a way to match the production nginx setup, and `site/` can be served by any static server.

## Adding an application

Each app appears on the hub as one entry. Once the app list lives in `js/apps.js` (or directly in `index.html`), add an entry in this shape:

```js
{
  name: "App Name",
  description: "One-sentence summary of what the app does.",
  url: "https://example.com/app-name/",   // or a relative path for apps in this repo
  icon: "🧩",                              // optional emoji or image path
  status: "live"                           // e.g. "live", "beta", "coming-soon"
}
```

Guidelines:

- Keep descriptions to one sentence.
- Use `coming-soon` for apps that are planned but not yet available; render them as disabled cards.
- Link to each app's own URL. The hub should not duplicate app logic.

## Design principles

- **Fast:** no external requests required to render the page.
- **Accessible:** semantic HTML, keyboard-navigable links, sufficient color contrast, and respect for `prefers-reduced-motion`.
- **Responsive:** the app grid adapts from one column on phones to several on desktop.
- **Themeable:** colors and spacing are defined as CSS custom properties, with light and dark variants via `prefers-color-scheme`.

## Deployment

Because the hub is static, it can be hosted on any static host, such as GitHub Pages, Netlify, or Cloudflare Pages. Publish the repository root (or a `docs/` folder if preferred) and point a domain at it when ready.

## Roadmap

- [ ] Create `index.html` with header, app grid, and footer
- [ ] Add base styles and light/dark theme in `css/styles.css`
- [ ] Move the app list into `js/apps.js`
- [ ] Add search or filtering for the app grid
- [ ] Add a "coming soon" state for planned apps
- [ ] Deploy to a static host

## Contributing

This is a personal project, so the workflow is simple: make a change on a branch, check it in a browser at desktop and phone widths, then merge into `main`.

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
