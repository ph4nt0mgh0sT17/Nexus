# Deployment

This guide applies to the whole Nexus project. Only the contents of `site/` are deployed. Specs, tooling and tests stay out of the served output.

**Status**: Draft. The server OS, domain and HTTPS setup are not decided yet. Placeholders are marked in the config below.

## Build

```bash
npm install
npm run build
```

Copy the contents of `site/` (`index.html`, `style.css`, `mockups/`, `thumbnails/`) to the server folder. Do not copy the repository root.

## nginx configuration

Save this as the site's nginx server block and adjust the placeholders.

```nginx
server {
    listen 80;
    server_name example.org;            # placeholder: domain not chosen yet
    root /var/www/nexus;                # placeholder: folder with the contents of site/
    index index.html;

    # Default for the page and its images: revalidate on every load.
    # nginx answers 304 Not Modified when nothing changed, so this stays cheap.
    location / {
        add_header Cache-Control "no-cache";
        try_files $uri $uri/ =404;
    }

    # The stylesheet URL changes with its content (style.css?v=<hash>),
    # so the browser can keep this file for a long time.
    location = /style.css {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Before reloading nginx on the server, check the config with `nginx -t`.

## Why these cache rules

- **HTML uses `no-cache`, not `no-store`.** `no-cache` makes the browser check with the server on each load. `no-store` stops caching completely, which costs more than it helps.
- **`style.css` can be cached for a year.** The page links `style.css?v=<hash>`, where the hash comes from the file's content. A new build produces a new URL, so an old copy is never used.
- **Images use the default rule.** `mockups/` and `thumbnails/` URLs do not change, so they are revalidated on each load rather than cached for a long time.

## Local checks

- The quickstart's Docker command (`nginx:alpine`) uses nginx's default config, which sends no `Cache-Control`. To test these rules locally, mount the config above into the container.
- Without Docker, `npx http-server site -c-1` turns caching off.

## Open items

These are tracked in [deployment-discussion.md](deployment-discussion.md): deployment model, server OS, domain, HTTPS, security headers, rollback, and whether `site/` stays committed.
