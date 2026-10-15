import { existsSync, readFileSync, watch, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = join(projectRoot, "data", "apps.json");
const templatePath = join(projectRoot, "src", "index.template.html");
const packagePath = join(projectRoot, "package.json");
const siteDir = join(projectRoot, "site");

const ID_PATTERN = /^[a-z][a-z0-9-]{1,39}$/;
const MOCKUP_PATTERN = /^[a-z0-9][a-z0-9.-]*\.svg$/;
const THUMBNAIL_PATTERN = /^[a-z0-9][a-z0-9.-]*\.webp$/;
const STATUSES = ["live", "preview", "unavailable"];

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

function isTrimmedLengthBetween(value, min, max) {
  if (typeof value !== "string") return false;
  const { length } = value.trim();
  return length >= min && length <= max;
}

function isFileName(value, pattern) {
  return typeof value === "string" && pattern.test(value);
}

// Root-relative paths are allowed; "//host" is protocol-relative, so it is rejected.
function isAllowedHref(href) {
  if (typeof href !== "string" || href === "") return false;
  if (href.startsWith("//")) return false;
  if (href.startsWith("/")) return true;
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

function validateStatusFields(entry) {
  const errors = [];
  if (entry.status === "live") {
    if (!isAllowedHref(entry.href)) {
      errors.push("href: required for live; must be https:// or a root-relative path starting with /");
    }
    if (entry.mockup !== undefined) errors.push("mockup: not used for live");
    return errors;
  }
  if (entry.href !== undefined) errors.push("href: only allowed for live");
  if (entry.status === "preview" && !isFileName(entry.mockup, MOCKUP_PATTERN)) {
    errors.push("mockup: required for preview; must be an .svg file name");
  }
  if (entry.status === "unavailable" && entry.mockup !== undefined && !isFileName(entry.mockup, MOCKUP_PATTERN)) {
    errors.push("mockup: must be an .svg file name when given");
  }
  return errors;
}

export function validateEntry(entry) {
  if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
    return { valid: false, errors: ["entry: must be an object"] };
  }
  const errors = [];
  if (typeof entry.id !== "string" || !ID_PATTERN.test(entry.id)) {
    errors.push("id: must match ^[a-z][a-z0-9-]{1,39}$");
  }
  if (!isTrimmedLengthBetween(entry.name, 1, 40)) errors.push("name: trimmed length must be 1-40");
  if (!isTrimmedLengthBetween(entry.description, 1, 160)) {
    errors.push("description: trimmed length must be 1-160");
  }
  if (!STATUSES.includes(entry.status)) errors.push("status: must be live, preview or unavailable");
  errors.push(...validateStatusFields(entry));
  if (!isFileName(entry.thumbnail, THUMBNAIL_PATTERN)) {
    errors.push("thumbnail: required; must be a .webp file name");
  }
  if (entry.mockupAlt !== undefined && typeof entry.mockupAlt !== "string") {
    errors.push("mockupAlt: must be a string");
  }
  return { valid: errors.length === 0, errors };
}

function describeEntry(entry, index) {
  const hasId = typeof entry === "object" && entry !== null && typeof entry.id === "string";
  return hasId ? `entry "${entry.id}"` : `entry #${index + 1}`;
}

export function validateEntries(list) {
  if (!Array.isArray(list)) return { valid: false, errors: ["apps: must be an array"] };
  const errors = [];
  const seenIds = new Set();
  list.forEach((entry, index) => {
    const label = describeEntry(entry, index);
    for (const error of validateEntry(entry).errors) errors.push(`${label} ${error}`);
    if (typeof entry === "object" && entry !== null && typeof entry.id === "string") {
      if (seenIds.has(entry.id)) errors.push(`${label} id: duplicate id`);
      seenIds.add(entry.id);
    }
  });
  return { valid: errors.length === 0, errors };
}

export function readApps(path) {
  const list = JSON.parse(readFileSync(path, "utf8"));
  const { valid, errors } = validateEntries(list);
  if (!valid) {
    throw new Error(`Invalid application entries in ${path}:\n${errors.map((error) => `  - ${error}`).join("\n")}`);
  }
  return list;
}

export function assertAssetsExist(apps, assetDir) {
  const errors = [];
  for (const entry of apps) {
    if (entry.mockup !== undefined && !existsSync(join(assetDir, "mockups", entry.mockup))) {
      errors.push(`entry "${entry.id}" mockup: mockups/${entry.mockup} not found`);
    }
    if (!existsSync(join(assetDir, "thumbnails", entry.thumbnail))) {
      errors.push(`entry "${entry.id}" thumbnail: thumbnails/${entry.thumbnail} not found`);
    }
  }
  if (errors.length > 0) throw new Error(`Missing assets:\n${errors.map((error) => `  - ${error}`).join("\n")}`);
}

function renderFigure(entry) {
  const showsPlaceholder = entry.status === "unavailable" && entry.mockup === undefined;
  const media = showsPlaceholder
    ? `<span class="app-card__media app-card__media--placeholder dot-grid">Preview not available</span>`
    : `<img class="app-card__media" src="thumbnails/${escapeHtml(entry.thumbnail)}" width="1280" height="800" alt="" loading="lazy">`;
  const chipLabel = { live: "Live", preview: "Preview", unavailable: "Unavailable" }[entry.status];
  return `<span class="app-card__figure">${media}<span class="app-chip app-chip--${entry.status}">${chipLabel}</span></span>`;
}

function renderCardBody(entry) {
  const footerLabel = { live: "Open", preview: "Coming soon", unavailable: "Unavailable" }[entry.status];
  return [
    renderFigure(entry),
    `<h3 class="app-card__title" id="app-${entry.id}-name">${escapeHtml(entry.name)}</h3>`,
    `<p class="app-card__description">${escapeHtml(entry.description)}</p>`,
    `<span class="app-card__footer">${footerLabel}</span>`,
  ].join("");
}

function renderLiveCard(entry) {
  return `<li class="app-card"><a class="app-card__box app-card__box--live" href="${escapeHtml(entry.href)}" aria-labelledby="app-${entry.id}-name">${renderCardBody(entry)}</a></li>`;
}

const INACTIVE_STATUS_TEXT = {
  preview: "Preview, coming soon. Not available to open.",
  unavailable: "Unavailable. Not available to open.",
};

function renderInactiveCard(entry) {
  return `<li class="app-card"><div class="app-card__box app-card__box--${entry.status}" id="app-${entry.id}" tabindex="0" aria-disabled="true" aria-describedby="app-${entry.id}-status">${renderCardBody(entry)}<span id="app-${entry.id}-status" class="sr-only">${INACTIVE_STATUS_TEXT[entry.status]}</span></div></li>`;
}

export function renderCard(entry) {
  return entry.status === "live" ? renderLiveCard(entry) : renderInactiveCard(entry);
}

export function renderEmptyState() {
  return `<div class="empty-state"><h3>No applications yet</h3><p>New applications will appear here as they are added.</p></div>`;
}

export function renderGrid(apps) {
  if (apps.length === 0) return renderEmptyState();
  return `<ul class="app-grid">${apps.map((entry) => renderCard(entry)).join("")}</ul>`;
}

export function renderFooter({ year, version }) {
  return `<footer class="site-footer page-container"><p>Copyright © ${escapeHtml(year)} Mikrite<span class="site-footer__version">v${escapeHtml(version)}</span></p></footer>`;
}

export function buildPage(template, apps, options) {
  return template
    .replace("<!-- APPLICATIONS -->", () => renderGrid(apps))
    .replace("<!-- FOOTER -->", () => renderFooter(options));
}

function buildSite() {
  const apps = readApps(dataPath);
  assertAssetsExist(apps, siteDir);
  const template = readFileSync(templatePath, "utf8");
  const { version } = JSON.parse(readFileSync(packagePath, "utf8"));
  const page = buildPage(template, apps, { year: new Date().getFullYear(), version });
  writeFileSync(join(siteDir, "index.html"), page);
  console.log(`Built site/index.html with ${apps.length} application(s).`);
}

function rebuildOnChange() {
  try {
    buildSite();
  } catch (error) {
    console.error(error.message);
  }
}

// Watch mode runs Tailwind in watch mode and rebuilds the page when data or the template changes.
function watchSite() {
  spawn("npx tailwindcss -i ./src/input.css -o ./site/style.css --watch", {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
  });
  rebuildOnChange();
  for (const path of [dataPath, templatePath]) {
    watch(path, rebuildOnChange);
  }
}

const isEntryPoint = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isEntryPoint) {
  if (process.argv.includes("--watch")) {
    watchSite();
  } else {
    buildSite();
  }
}
