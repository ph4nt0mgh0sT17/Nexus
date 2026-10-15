# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a security problem. Report it privately through GitHub's private vulnerability reporting on this repository (Security tab, "Report a vulnerability"). The owner will respond there.

## What this repository must not contain

This repository is public. Never commit:

- passwords, API keys, access tokens or private keys
- `.env` files or any local configuration with credentials
- certificates or private keys, such as `*.pem`, `*.key` or `*.p12`
- personal data

The project constitution states the same rule (Technology and Quality Constraints). `.gitignore` excludes the common file types, but it is not a substitute for checking your changes before you commit.

If a secret is committed by accident, treat it as leaked: revoke or rotate it first, then remove it from the history. Deleting the file in a new commit is not enough, because the old commit stays public.

## What is public

- The source, the built site in `site/`, and the release tarballs attached to GitHub Releases are all public. Anyone can download them without signing in.
- The server that serves the site is not described in detail here. Its access details are kept outside this repository.
