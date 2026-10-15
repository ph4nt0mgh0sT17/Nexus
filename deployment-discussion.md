# Deployment Discussion: Mikrite Nexus Front Page

**Status**: Open. Some requirements are decided (below). The rest is parked for a future session.

**On hold**: Deployment is not moving forward yet. No deployment work (server setup, release layout, HTTPS, domain) starts until this hold is lifted. Recorded 2026-10-15.
**Date opened**: 2026-10-15 | **Plan**: [plan.md](specs/001-mikrite-nexus-front-page/plan.md) | **Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

Points to settle before the first release. The plan does not depend on the answers; they only affect how the built `site/` folder reaches the server.

## Decided requirements

- **Linux server, managed by its administrator.** Standard packages and systemd only. The admin must be able to run, update and back it up with their usual tools.
- **Distribution: Debian 13 (trixie).** Decided 2026-10-15. The RHEL family (Rocky / AlmaLinux) is not in scope. CentOS Linux 7 and 8 are end-of-life and are not an option.
- **No GitHub Actions for now.** It is reserved as a future topic (see [DEPLOYMENT.md](DEPLOYMENT.md), "Automated deployment (reserved)"). Do not design it yet.
- **The repository is public and holds no credentials.** Release tarballs can be downloaded without authentication. Guidance is in [SECURITY.md](SECURITY.md).
- **Docker is for local testing.** The user wants a Docker test chapter; it is in [DEPLOYMENT.md](DEPLOYMENT.md), "Testing in Docker".

## Points to discuss

1. **Deployment model**: decided 2026-10-15. Manual deploy: the admin downloads the release tarball from GitHub on the server, verifies it and switches the symlink (steps in [DEPLOYMENT.md](DEPLOYMENT.md), "Release layout"). A CI pipeline with GitHub Actions can replace this later; the release layout keeps that possible.
2. **Release layout and rollback**: decided 2026-10-15 (option A). GitHub Releases hold the full history. The server keeps one live release behind a `current` symlink, and rollback downloads the earlier tarball from GitHub. Details in [DEPLOYMENT.md](DEPLOYMENT.md).
3. **Server distribution and firewall**: decided 2026-10-15. Debian 13 (trixie), with `ufw` as the firewall (deny incoming by default, allow SSH and Nginx). Steps in [DEPLOYMENT.md](DEPLOYMENT.md), "Debian setup".
4. **Domain name**: parked. Preferred: `mikrite.cz` or a similar name. Not owned yet, and availability is not checked. Decided 2026-10-15: the bare domain is canonical, and `www` redirects to it. Both need DNS records pointing at the VPS. Needed for HTTPS certificates and for the link checks in the quickstart. Until it is chosen, `server_name` in `deploy/nginx/nexus.conf` stays as the `example.org` placeholder, and HTTPS (point 5) waits on it. Revisit before the first release.
5. **HTTPS**: decided 2026-10-15. Let's Encrypt via Certbot (webroot method, so the nginx config stays in the repo), renewed by the Debian `certbot.timer`. The steps are in [DEPLOYMENT.md](DEPLOYMENT.md), "HTTPS (Certbot)". Nothing runs until the domain is owned (point 4).
6. **nginx configuration and security headers**: decided 2026-10-15. The server block is [deploy/nginx/nexus.conf](deploy/nginx/nexus.conf). The headers are in [deploy/nginx/security-headers.conf](deploy/nginx/security-headers.conf): strict CSP, nosniff, DENY framing, referrer and permissions policies. HSTS waits for HTTPS. Details in [DEPLOYMENT.md](DEPLOYMENT.md), "Security headers".
7. **Built output in version control**: decided 2026-10-15. `site/index.html` and `site/style.css` are generated and not committed (ignored in `.gitignore`). The thumbnails and mockups in `site/` are source assets and stay committed. The release is built on the developer's machine, not on the server.
8. **Release checks**: decided 2026-10-15. Every `live` link in `data/apps.json` must resolve before each release, including releases that only change the app list (constitution Principle II). Manual for now; automate when GitHub Actions arrives. The app list stays compiled at build time, not fetched at runtime.
9. **Staging**: decided 2026-10-15: no separate staging server for now. Testing uses the Docker checks locally, Let's Encrypt's staging mode for certificates, and checks on the VPS right after setup. Revisit if the site starts handling anything more important than a static page. Options considered: a second VPS, or a local VM.
10. **Server administration**: decided 2026-10-15. The server is a VPS, and the repository owner is its administrator. The admin checklist is in [DEPLOYMENT.md](DEPLOYMENT.md), "Server operations". Reboots happen whenever a kernel update needs one, with no fixed window. Backups: decided 2026-10-15, none for now. The server is rebuilt from the guide and the GitHub release (see "Backups" in DEPLOYMENT.md).

## Known constraints

- Only `site/` is served. Specs, tooling and tests stay out of the served output.
- Production runs nginx (per the tech doc). Local testing matches it with Docker `nginx:1.27-alpine`, and the distribution's own nginx can check the config too.
- No third-party requests and no analytics (constitution).
- The page must work with the performance budget in [research.md](specs/001-mikrite-nexus-front-page/research.md) section 10.
- Docker tests do not cover the firewall, file permissions or HTTPS. Those are checked on the VPS itself.

## Recommendations (architect view, not yet decided)

- **Fact**: a static site needs only nginx and a folder. Anything more on the server is more for the admin to maintain.
- **Decided 2026-10-15**: no Docker on the production server. Docker is for local testing only. Written into [DEPLOYMENT.md](DEPLOYMENT.md), "Server requirements".
- **Recommendation**: a symlink-based release layout over copying files in place. It makes rollback instant and keeps the nginx config unchanged between releases.
- **Recommendation**: add HTTPS with Certbot and the distribution's own package, with automatic renewal from the package's timer.

## Next step

Settle the open point above (domain). Record each decision in this file, then move the lasting parts into [DEPLOYMENT.md](DEPLOYMENT.md) and delete this file once all points are closed.
