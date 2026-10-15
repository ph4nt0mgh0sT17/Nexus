# Deployment Discussion: Mikrite Nexus Front Page

**Status**: Open. Nothing here is decided. Parked for a future session.
**Date opened**: 2026-10-15 | **Plan**: [plan.md](plan.md)

Points to settle before the first release. The plan does not depend on the answers; they only affect how the built `site/` folder reaches the server.

## Points to discuss

1. **Deployment model**: how the built `site/` folder gets from this repository to production. Currently open: manual copy vs. automated pipeline.
2. **Deployment method**: manual copy to the server first (per the tech doc), with GitHub Actions (SSH or rsync) deferred until the page exists.
3. **Server OS**: not yet known. Affects package install, nginx config paths and firewall setup.
4. **Domain name**: not yet chosen. Needed for HTTPS certificates and for the link checks in the quickstart.
5. **HTTPS**: certificate provider and renewal. Certbot is the usual choice with nginx; not yet confirmed.
6. **nginx configuration**: site root, caching headers for `style.css` and the mock-up SVGs, and security headers. Not yet written.
7. **Built output in version control**: whether `site/index.html` and `site/style.css` stay committed, or are generated at deploy time.
8. **Rollback**: how to restore the previous version if a release breaks the page.
9. **Release checks**: confirm every `live` link in `data/apps.json` resolves before each release (constitution Principle II).

## Known constraints

- Only `site/` is served. Specs, tooling and tests stay out of the served output.
- Production runs nginx (per the tech doc). Local testing matches it with Docker `nginx:alpine`.
- No third-party requests and no analytics (constitution).
- The page must work with the performance budget in [research.md](research.md) section 10.

## Next step

Pick these up in a future session with a deployment-focused agent. Record each decision here and update the plan's Open Decisions when settled.
