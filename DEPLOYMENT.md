# Deployment

This guide applies to the whole Nexus project. Only the contents of `site/` are deployed. Specs, tooling and tests stay out of the served output.

**Status**: Draft. Decided: a Debian 13 (trixie) VPS run by its administrator, with standard packages, manual releases, `ufw` as the firewall, and no staging server or CI/CD for now. HTTPS is decided (Certbot, see below) but waits for the domain. Still open: the domain. The VPS does not exist yet. Placeholders are marked in the config.

## Build and release

Decided: the release is built on the development machine, published on GitHub, and deployed to the server by hand. A GitHub Actions pipeline can build it later.

1. **Build** from the tagged commit, using the lockfile so the output is reproducible:

   ```bash
   npm ci
   npm run build
   ```

   This generates `site/index.html` and `site/style.css`. They are not committed. The thumbnails and mockups in `site/` are source assets and are committed.
2. **Set the version** before tagging. The footer shows the `version` field from `package.json`, so the release must change it:

   ```bash
   npm version 1.0.0 --no-git-tag-version
   ```

   Commit the change through a pull request into `main`, as the constitution requires. The flag stops npm from creating its own commit and tag. Local builds stay at `0.0.0`.
3. **Tag** the merge commit. Keep the tag and `package.json` in step: the footer shows the `package.json` version, and the tag names the release. The footer year is the year of the build, so a rebuild in a new year changes the copyright line.

   ```bash
   TAG=v1.0.0
   git tag -a $TAG -m "Release $TAG"
   git push origin $TAG
   ```

   PowerShell: `$TAG = "v1.0.0"`, then the same three `git` lines.

4. **Package** the contents of `site/` (`index.html`, `style.css`, `mockups/`, `thumbnails/`) as a tarball, with a SHA-256 checksum next to it. Do not package the repository root. Run this from the repository root, after `npm run build`.

   Bash:

   ```bash
   TAG=v1.0.0
   tar -czf nexus-$TAG.tar.gz -C site .
   sha256sum nexus-$TAG.tar.gz > nexus-$TAG.tar.gz.sha256
   ```

   PowerShell (Windows 10 and 11 include `tar`):

   ```powershell
   $TAG = "v1.0.0"
   tar -czf "nexus-$TAG.tar.gz" -C site .
   $hash = (Get-FileHash "nexus-$TAG.tar.gz" -Algorithm SHA256).Hash.ToLower()
   [IO.File]::WriteAllText("$PWD\nexus-$TAG.tar.gz.sha256", "$hash  nexus-$TAG.tar.gz`n")
   ```

   The checksum file must use the `hash  filename` format with a LF line ending, because the server runs `sha256sum -c` on it. The PowerShell line writes it that way.

5. **Create the GitHub Release** for the tag and attach both files. Either command works:

   Command line (needs `gh auth login` once):

   ```bash
   gh release create $TAG nexus-$TAG.tar.gz nexus-$TAG.tar.gz.sha256 --title $TAG --notes "Release $TAG"
   ```

   Web: on the repository's Releases page, choose "Draft a new release", pick the tag, attach both files and publish.

6. **Deploy** on the server as described in "Release layout".

**Release check** (before step 3, the tag): confirm every entry in `data/apps.json` with `"status": "live"` has an `href` that resolves to a successful response. The build only checks the link's format, not that it works. Fix or downgrade any broken entry first. This applies to every release, including releases that only change the app list. Manual for now; to be automated with GitHub Actions later.

The server only downloads and extracts the tarball, and never builds.

## Server requirements

- A Linux server run by its administrator. Use only standard packages and systemd services, so the admin can manage it with their usual tools.
- Distribution: Debian 13 (trixie), the current stable release.
- nginx from the distribution's own package repository.
- The server does not need Node.js or the build tools. The build runs on the development machine.
- No Docker on the server. Docker is used only for local testing (see "Testing in Docker"). The server runs nginx directly from its package.
- The repository is public and holds no credentials, so the server can download release tarballs without authentication. See [SECURITY.md](SECURITY.md).

## Debian setup

- Install: `apt install nginx`
- Config: copy `deploy/nginx/nexus.conf` to `/etc/nginx/sites-available/nexus`, then enable it with `ln -s /etc/nginx/sites-available/nexus /etc/nginx/sites-enabled/nexus`. Remove the default site if it would conflict.
- Snippet: copy `deploy/nginx/security-headers.conf` to `/etc/nginx/snippets/security-headers.conf`. The server config includes it by that path, so `nginx -t` fails without it.
- Firewall: `ufw`, with incoming traffic denied by default. Allow SSH before enabling it, or you will lock yourself out:

  ```bash
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw enable
  ```

  Before HTTPS is set up, `Nginx Full` can be replaced by `Nginx HTTP`. See "Server operations".
- Check the config with `nginx -t` before reloading with `systemctl reload nginx`.

## nginx configuration

The server block is in [deploy/nginx/nexus.conf](deploy/nginx/nexus.conf). Copy that file to the config path from "Debian setup" above and adjust the placeholders (`server_name`, and `root` if the layout changes). The same file is used for the Docker tests, so the tested config and the deployed config do not drift apart.

Its cache rules are explained below. The security headers are in a separate snippet, explained in "Security headers" below.

## Security headers

The headers are in [deploy/nginx/security-headers.conf](deploy/nginx/security-headers.conf) and included in every location. Headers are included per location because `add_header` in a location replaces the server-level headers. Each one uses `always`, so error responses such as 404 keep them.

| Header | Value | Why |
|---|---|---|
| `Content-Security-Policy` | `default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` | The page has no scripts, forms, frames or third-party requests. The policy blocks anything else. Checked on the built `site/`: the CSS loads no external files or fonts. |
| `X-Content-Type-Options` | `nosniff` | Browsers use the declared file type. |
| `X-Frame-Options` | `DENY` | Legacy header for old browsers. `frame-ancestors` covers the rest. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Links to the apps send only the origin, not the full page URL. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Turns off device features the page never uses. |

Also set in the server block: `server_tokens off;`, which hides the nginx version.

**HSTS** (`Strict-Transport-Security`) is not in the snippet. It belongs only in the HTTPS server block, once HTTPS works. Start with a short `max-age` (for example 300) while testing, then raise it to one year. Leave out `includeSubDomains` and `preload` until the domain is chosen.

**Trade-off**: a strict CSP makes any future JavaScript a visible change. That fits the constitution, which says the hub ships no client-side JavaScript without an amendment. If an app needs a script, the policy must change deliberately.

## HTTPS (Certbot)

**Decided**: HTTPS with a Let's Encrypt certificate, issued and renewed by Certbot on the server. **Blocked until the domain is owned and its DNS record points at the server.** Let's Encrypt cannot issue a certificate for a name that does not resolve to the server. Nothing below should be run before then.

Certbot runs on the server with the `webroot` method, not the `--nginx` plugin. The plugin edits the nginx config on the server itself, so the server would drift from `deploy/nginx/nexus.conf`. The webroot method leaves the config in the repository as the single source.

Steps, once the domain is ready and port 80 and 443 are open. **Order matters:** the port 80 redirect in step 6 must not go live before the certificate from step 5 exists. Otherwise visitors get a broken HTTPS page. Keep the redirect out of the config until step 6.

1. **Install**: `apt install certbot`.
2. **Create the challenge folder**: `mkdir -p /var/www/acme`.
3. **Add the challenge location** to the port 80 block in `deploy/nginx/nexus.conf`, before any redirect:

   ```nginx
   location /.well-known/acme-challenge/ {
       root /var/www/acme;
   }
   ```

   Reload nginx so the location is live.
4. **Test with Let's Encrypt's staging mode first**, so a mistake does not count against its rate limits. There is no separate staging server on this project:

   ```bash
   certbot certonly --webroot -w /var/www/acme --staging -d <domain> -d www.<domain>
   ```

5. **Issue the real certificate** by running the same command without `--staging`. Add `--deploy-hook "systemctl reload nginx"` so renewals reload nginx automatically.
6. **Add the HTTPS block** to `deploy/nginx/nexus.conf`, and redirect port 80 to HTTPS:

   ```nginx
   # www redirects to the bare domain, which is the canonical address
   server {
       listen 443 ssl;
       server_name www.<domain>;
       ssl_certificate     /etc/letsencrypt/live/<domain>/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/<domain>/privkey.pem;
       ssl_protocols TLSv1.2 TLSv1.3;
       return 301 https://<domain>$request_uri;
   }

   server {
       listen 443 ssl;
       server_name <domain>;
       ssl_certificate     /etc/letsencrypt/live/<domain>/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/<domain>/privkey.pem;
       ssl_protocols TLSv1.2 TLSv1.3;
       # same root, locations, cache rules and security headers include as the port 80 block,
       # plus the HSTS line below in each location (add_header in a location replaces server-level headers)
       # add_header Strict-Transport-Security "max-age=300" always;   # raise to 31536000 once HTTPS is confirmed
   }
   ```

   The port 80 block keeps the challenge location and returns `301 https://$host$request_uri` for everything else. The DNS needs two records: `<domain>` and `www.<domain>`, both pointing at the VPS.
7. **Check and reload**: `nginx -t`, then `systemctl reload nginx`.

**Renewal**: the Debian package installs a systemd timer (`certbot.timer`) that runs renewal twice a day. Certificates renew about 30 days before expiry. Debian does not send renewal failures anywhere unless mail is set up, so a silent failure is possible. The monthly `certbot renew --dry-run` check in "Server operations" is the safety net. Check it with:

```bash
systemctl list-timers | grep certbot
certbot renew --dry-run
```

**Testing**: Docker cannot test certificate issuance, because it needs the real domain and public port 80. Test HTTPS on the VPS after the domain points at it, and check the result with `openssl s_client -connect <domain>:443`.

## Release layout

GitHub Releases are the only release history. Each release is a tag with the `site/` tarball attached. The server holds one live release, pointed to by a `current` symlink that nginx serves through:

```
/var/www/nexus/
  releases/
    v1.0.0/             <- the one live release (contents of site/)
  current -> releases/v1.0.0   <- nginx root points here
```

**Deploy** (run on the server, as the admin, with `TAG` set to the release, for example `v1.0.0`). Replace `<owner>/<repo>` with the public repository path:

```bash
TAG=v1.0.0
BASE=https://github.com/<owner>/<repo>/releases/download/$TAG

# 1. Download the tarball and its checksum
curl -fLO $BASE/nexus-$TAG.tar.gz
curl -fLO $BASE/nexus-$TAG.tar.gz.sha256

# 2. Verify it. Stop if this does not print "OK".
sha256sum -c nexus-$TAG.tar.gz.sha256

# 3. Extract into a new release folder
sudo mkdir -p /var/www/nexus/releases/$TAG
sudo tar -xzf nexus-$TAG.tar.gz -C /var/www/nexus/releases/$TAG
sudo chmod -R a+rX /var/www/nexus/releases/$TAG

# 4. Switch the live release. The symlink switch is atomic, so the site never serves a half-copied release.
sudo ln -sfn /var/www/nexus/releases/$TAG /var/www/nexus/current

# 5. Check the live release on the server
curl -sI http://localhost/ | head -n 1                     # before HTTPS: HTTP/1.1 200 OK
curl -sI http://localhost/ | grep -i content-security-policy   # expect: the policy is present
# after HTTPS, port 80 redirects, so check the public address instead:
curl -sI https://<domain>/ | head -n 1                     # expect: HTTP/2 200 (or HTTP/1.1 200)
```

If a check fails, roll back at once (below). When the new release is confirmed, delete the old folder, for example `sudo rm -rf /var/www/nexus/releases/<old-tag>`. Check the path before deleting.

**Rollback**: the same steps with the earlier tag. Download, verify, extract, switch the symlink, check, and then delete the folder of the release you rolled back from. No nginx reload is needed.

## Why these cache rules

- **HTML uses `no-cache`, not `no-store`.** `no-cache` makes the browser check with the server on each load. `no-store` stops caching completely, which costs more than it helps.
- **`style.css` can be cached for a year.** The page links `style.css?v=<hash>`, where the hash comes from the file's content. A new build produces a new URL, so an old copy is never used.
- **Images use the default rule.** `mockups/` and `thumbnails/` URLs do not change, so they are revalidated on each load rather than cached for a long time.

## Testing in Docker

Docker is a local test tool only, and it is never used on the production server. It runs the same nginx config as production, so you can check the config and the cache and security headers before a release.

The commands below are written for a Windows development machine. Bash versions are given where they differ.

**Status**: these commands have not been run yet on this project. Run them once, and fix this guide if anything differs.

### Prerequisites (Windows)

1. **Install Docker Desktop** from the official Docker website. On Windows 11 it uses the WSL 2 backend. Accept the installer's offer to enable WSL 2 if it asks.
2. **Start Docker Desktop** and wait until it reports that Docker is running.
3. **Check it works**: run `docker version` in PowerShell. You should see both a Client and a Server section. If only the Client appears, Docker Desktop is not running.
4. **Run every command from the repository root**, the folder that contains `deploy/` and `site/`. The commands mount paths relative to that folder. The repository is on drive C:, which Docker Desktop shares by default.
5. **Build first** with `npm run build` for step 2 and step 3, so that `site/index.html` and `site/style.css` exist.

### 1. Check the config syntax

What it does: starts nginx with the production config and runs `nginx -t`, which reads the config and reports errors without serving anything. Expected output ends with `test is successful`. The container then exits.

```bash
docker run --rm \
  -v "$PWD/deploy/nginx/nexus.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v "$PWD/deploy/nginx/security-headers.conf:/etc/nginx/snippets/security-headers.conf:ro" \
  nginx:1.27-alpine nginx -t
```

PowerShell:

```powershell
docker run --rm -v "${PWD}/deploy/nginx/nexus.conf:/etc/nginx/conf.d/default.conf:ro" -v "${PWD}/deploy/nginx/security-headers.conf:/etc/nginx/snippets/security-headers.conf:ro" nginx:1.27-alpine nginx -t
```

### 2. Serve the site with the production config

What it does: serves the built site with the production config on `http://localhost:8080`. In the command, `-p 8080:80` maps your port 8080 to nginx's port 80. The first `-v` mounts `site/` read-only at the path the config uses (`/var/www/nexus/current`), so the config needs no changes. The other two `-v` lines replace the Alpine image's default config with ours.

Build first (`npm run build`). Leave this running in its own terminal. Stop it with **Ctrl+C**. Because of `--rm`, the container is removed when it stops, so nothing is left behind.

```bash
docker run --rm -p 8080:80 \
  -v "$PWD/site:/var/www/nexus/current:ro" \
  -v "$PWD/deploy/nginx/nexus.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v "$PWD/deploy/nginx/security-headers.conf:/etc/nginx/snippets/security-headers.conf:ro" \
  nginx:1.27-alpine
```

PowerShell (one line):

```powershell
docker run --rm -p 8080:80 -v "${PWD}/site:/var/www/nexus/current:ro" -v "${PWD}/deploy/nginx/nexus.conf:/etc/nginx/conf.d/default.conf:ro" -v "${PWD}/deploy/nginx/security-headers.conf:/etc/nginx/snippets/security-headers.conf:ro" nginx:1.27-alpine
```

Open http://localhost:8080 in a browser. The page should look the same as the production build, with the cards and the footer.

### 3. Check the cache and security headers

What it does: asks the running container for response headers and checks the values. Run it in a second terminal while step 2 is running. On Windows, use `curl.exe`: in PowerShell, `curl` is an alias for a different command.

Get the current stylesheet hash from the built page:

PowerShell:

```powershell
(Select-String -Path site\index.html -Pattern 'style\.css\?v=[0-9a-f]+').Matches.Value
```

Bash:

```bash
grep -o 'style.css?v=[^"]*' site/index.html
```

Then check the headers. Each command has the expected result in its comment.

PowerShell:

```powershell
curl.exe -sI http://localhost:8080/ | Select-String 'cache-control'
# expect: no-cache

curl.exe -sI "http://localhost:8080/style.css?v=<hash>" | Select-String 'cache-control'
# expect: public, max-age=31536000, immutable

curl.exe -sI http://localhost:8080/mockups/notes.svg | Select-String 'cache-control'
# expect: no-cache

curl.exe -sI http://localhost:8080/does-not-exist | Select-Object -First 1
# expect: HTTP/1.1 404 Not Found

curl.exe -sI http://localhost:8080/does-not-exist | Select-String -Pattern 'content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy'
# expect: all five security headers, also on the 404 response

curl.exe -sI http://localhost:8080/ | Select-String -Pattern 'content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy'
# expect: all five security headers on the home page
```

Bash:

```bash
curl -sI http://localhost:8080/ | grep -i cache-control
# expect: no-cache

curl -sI "http://localhost:8080/style.css?v=<hash>" | grep -i cache-control
# expect: public, max-age=31536000, immutable

curl -sI http://localhost:8080/mockups/notes.svg | grep -i cache-control
# expect: no-cache

curl -sI http://localhost:8080/does-not-exist | head -n 1
# expect: HTTP/1.1 404 Not Found

curl -sI http://localhost:8080/does-not-exist | grep -i -E 'content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy'
# expect: all five security headers, also on the 404 response
```

### 4. Check Debian's own nginx (optional)

What it does: installs Debian 13's nginx package inside a container and runs `nginx -t` on the same config files. The Alpine image is not Debian, so this catches include-path mistakes that Alpine would miss. It takes a minute, because it downloads packages.

Expect a warning about a duplicate default server. Debian's package installs its own default site, which conflicts with ours in this test only. The warning is expected, and the config is valid if the output ends with `test is successful`.

PowerShell:

```powershell
docker run --rm -v "${PWD}/deploy/nginx/nexus.conf:/etc/nginx/sites-enabled/nexus:ro" -v "${PWD}/deploy/nginx/security-headers.conf:/etc/nginx/snippets/security-headers.conf:ro" debian:13-slim sh -c "apt-get update -qq && apt-get install -y -qq nginx >/dev/null && nginx -t"
```

Bash:

```bash
docker run --rm \
  -v "$PWD/deploy/nginx/nexus.conf:/etc/nginx/sites-enabled/nexus:ro" \
  -v "$PWD/deploy/nginx/security-headers.conf:/etc/nginx/snippets/security-headers.conf:ro" \
  debian:13-slim sh -c "apt-get update -qq && apt-get install -y -qq nginx >/dev/null && nginx -t"
```

### What Docker does not test

- The firewall, file ownership and the real server's network. Check these on the VPS itself, right after setup.
- HTTPS and certificate issuance. See "HTTPS (Certbot)" above.

### Versions

Pin the image tag (`nginx:1.27-alpine`) so results repeat. Change the tag on purpose, not by accident. Match it to the nginx version on the server when that is known.

### Stopping and cleaning up

- A running test (step 2) stops with **Ctrl+C**. `--rm` removes its container.
- Images stay on disk after the tests. They can be removed in Docker Desktop, or with `docker image prune` if you want to free space.
- If a command fails with a file-sharing or drive error, check Docker Desktop's Settings, under Resources, File sharing, and make sure the repository's drive is shared.

## First install (VPS checklist)

Run these in order on a new VPS. Each step builds on the one before. Keep one SSH session open as root until step 4 is confirmed working.

1. **Create the VPS** with Debian 13. Add your SSH public key in the provider's panel when you create it, so you never need a password.
2. **Create the admin user**: `adduser <admin>`, then `usermod -aG sudo <admin>`. Copy your public key to that user's `~/.ssh/authorized_keys`.
3. **Test the admin login** in a second terminal with `ssh <admin>@<server>`, and run `sudo true`. Do not continue until this works.
4. **Harden SSH** as in "Server operations", then `systemctl reload ssh`. Test again in a new session before closing the root session.
5. **Update the system**: `sudo apt update && sudo apt upgrade`. Then enable `unattended-upgrades` as in "Server operations".
6. **Set up the firewall** as in "Debian setup": deny incoming, then `ufw allow OpenSSH`, then enable it. Check with `sudo ufw status verbose`. Add `Nginx Full` later, when HTTPS is ready.
7. **Install fail2ban**: `sudo apt install fail2ban`.
8. **Install nginx**: `sudo apt install nginx`, then remove the default site with `sudo rm /etc/nginx/sites-enabled/default`.
9. **Copy the config files** from the repository (from your development machine, with `scp`), then move them into place:
   - `deploy/nginx/nexus.conf` to `/etc/nginx/sites-available/nexus`
   - `deploy/nginx/security-headers.conf` to `/etc/nginx/snippets/security-headers.conf`

   Enable the site: `sudo ln -s /etc/nginx/sites-available/nexus /etc/nginx/sites-enabled/nexus`.
10. **Create the release folder**: `sudo mkdir -p /var/www/nexus/releases`.
11. **Check and reload nginx**: `sudo nginx -t`, then `sudo systemctl reload nginx`.
12. **Deploy the first release** with the steps in "Release layout", then check it with `curl -sI http://localhost/`.
13. **Wait for the domain.** When it is owned, add DNS records for the domain and `www`, both pointing at the VPS, then follow "HTTPS (Certbot)".

Never put the admin's private key, or any token, on the server or in the repository.

## Server operations

The server is a VPS run by the repository owner, who is also its administrator. This section is the admin's checklist. Keep anything that identifies the server, its access, or its contacts out of this repository, since it is public.

### Access

- SSH key login only. Disable password login and root login in `/etc/ssh/sshd_config` (`PasswordAuthentication no`, `PermitRootLogin no`), then `systemctl reload ssh`. Keep an existing session open while testing, so a mistake cannot lock you out.
- Use a named admin account with `sudo`.
- Firewall with `ufw`, set up as in "Debian setup": deny incoming by default, allow `OpenSSH` and `Nginx Full` (ports 80 and 443). Check the rules with `ufw status verbose` after any change. If the provider offers a cloud firewall, enable it too, as a second layer.
- Install `fail2ban` to slow down repeated failed logins.

### Updates

- Enable automatic security updates with `unattended-upgrades` (`apt install unattended-upgrades`, then `dpkg-reconfigure -plow unattended-upgrades`).
- Once a month, run `apt update && apt upgrade` and check whether the kernel or nginx needs a restart.
- Reboots happen whenever a kernel update needs one. There is no fixed window. Expect a short outage of a few minutes, and reboot when traffic is low.

### Releases

Deploy and roll back as described in "Build and release" and "Release layout". The server never builds the site.

### Certificates

- Check the renewal timer: `systemctl list-timers | grep certbot`.
- Once a month, run `certbot renew --dry-run`. Renewal is automatic, so this check catches a broken setup before a certificate expires.

### Logs and health

- nginx access log: `/var/log/nginx/access.log`. Errors: `/var/log/nginx/error.log`.
- Service status: `systemctl status nginx`, and `journalctl -u nginx` for recent messages.
- Before any reload, check the config with `nginx -t`.

### Backups

Decided: no server backups for now. The site is rebuilt from its GitHub release, the config is in git, and the server's setup is written down in this guide. If the VPS is lost, rebuild it from the steps above and reissue the certificates with Certbot.

- Keep the DNS records, the registrar login and the VPS provider login in a password manager, not on the server.
- Revisit this when the server holds anything that is not in git or in this guide.

## Automated deployment (reserved)

Deployment is a manual copy for now. A CI pipeline with GitHub Actions can take over later. It is reserved, not designed. When it is discussed, it would cover pushing a release folder to the server over SSH or rsync, the secrets it needs, and the release checks.

## Local checks without Docker

- `npx http-server site -c-1` turns caching off, but it is not nginx, so the headers differ from production.

## Open items

These are tracked in [deployment-discussion.md](deployment-discussion.md): the domain.
