import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertAssetsExist,
  buildPage,
  readApps,
  renderCard,
  renderFooter,
  renderGrid,
  stylesheetVersion,
  validateEntries,
  validateEntry,
} from "../scripts/build-site.mjs";

const testsDir = dirname(fileURLToPath(import.meta.url));
const template = readFileSync(join(testsDir, "..", "src", "index.template.html"), "utf8");
const footerOptions = { year: 2026, version: "0.0.0", styleVersion: "abc123" };

const livePart = { id: "tasks", name: "Tasks", description: "Plan your work.", status: "live", href: "/tasks/", thumbnail: "tasks.webp" };
const previewPart = { id: "notes", name: "Notes", description: "Quick capture.", status: "preview", mockup: "notes.svg", thumbnail: "notes.webp" };
const unavailablePart = { id: "archive", name: "Archive", description: "Reference material.", status: "unavailable", thumbnail: "archive.webp" };

function withField(base, field, value) {
  return { ...base, [field]: value };
}

function withoutField(base, field) {
  const copy = { ...base };
  delete copy[field];
  return copy;
}

function assertAccepted(entry) {
  const result = validateEntry(entry);
  assert.equal(result.valid, true, result.errors.join("; "));
}

function assertRejectedWith(entry, fieldPrefix) {
  const result = validateEntry(entry);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.startsWith(fieldPrefix)), `expected ${fieldPrefix} in ${result.errors.join("; ")}`);
}

test("validateEntry accepts one valid entry per status", () => {
  assertAccepted(livePart);
  assertAccepted(previewPart);
  assertAccepted(unavailablePart);
});

test("validateEntry id rule", () => {
  assertAccepted(withField(previewPart, "id", "notes-2"));
  assertRejectedWith(withField(previewPart, "id", "Notes"), "id:");
  assertRejectedWith(withField(previewPart, "id", "1notes"), "id:");
});

test("validateEntry name rule", () => {
  assertAccepted(withField(previewPart, "name", "N".repeat(40)));
  assertRejectedWith(withField(previewPart, "name", "N".repeat(41)), "name:");
  assertRejectedWith(withField(previewPart, "name", "   "), "name:");
});

test("validateEntry description rule", () => {
  assertAccepted(withField(previewPart, "description", "d".repeat(160)));
  assertRejectedWith(withField(previewPart, "description", "d".repeat(161)), "description:");
});

test("validateEntry status rule", () => {
  assertAccepted(withField(previewPart, "status", "preview"));
  assertRejectedWith(withField(previewPart, "status", "beta"), "status:");
});

test("validateEntry href rule", () => {
  assertAccepted(withField(livePart, "href", "https://tasks.example.org/"));
  assertAccepted(withField(livePart, "href", "/tasks/"));
  assertRejectedWith(withField(livePart, "href", "javascript:alert(1)"), "href:");
  assertRejectedWith(withField(livePart, "href", "data:text/html,hi"), "href:");
  assertRejectedWith(withField(livePart, "href", "//evil.example/"), "href:");
  assertRejectedWith(withField(livePart, "href", ""), "href:");
  assertRejectedWith(withField(livePart, "href", undefined), "href:");
  assertRejectedWith(withField(previewPart, "href", "/tasks/"), "href:");
});

test("validateEntry mockup rule", () => {
  assertAccepted(withField(previewPart, "mockup", "notes.svg"));
  assertRejectedWith(withoutField(previewPart, "mockup"), "mockup:");
  assertRejectedWith(withField(previewPart, "mockup", "../notes.svg"), "mockup:");
  assertRejectedWith(withField(previewPart, "mockup", "Notes.svg"), "mockup:");
  assertRejectedWith(withField(livePart, "mockup", "tasks.svg"), "mockup:");
});

test("validateEntry thumbnail rule", () => {
  assertAccepted(withField(previewPart, "thumbnail", "notes.webp"));
  assertRejectedWith(withField(previewPart, "thumbnail", "notes.png"), "thumbnail:");
  assertRejectedWith(withoutField(previewPart, "thumbnail"), "thumbnail:");
});

test("validateEntry mockupAlt rule", () => {
  assertAccepted(withField(previewPart, "mockupAlt", "Wireframe of the notes list"));
  assertRejectedWith(withField(previewPart, "mockupAlt", 5), "mockupAlt:");
});

test("validateEntries rejects duplicate ids and non-arrays", () => {
  assert.equal(validateEntries([previewPart, withField(livePart, "id", "notes")]).valid, false);
  assert.equal(validateEntries({}).valid, false);
  assert.equal(validateEntries([]).valid, true);
});

test("readApps throws naming the entry id and the broken field", () => {
  const directory = mkdtempSync(join(tmpdir(), "nexus-apps-"));
  try {
    const path = join(directory, "apps.json");
    writeFileSync(path, JSON.stringify([withField(previewPart, "name", "")]));
    assert.throws(() => readApps(path), (error) => /entry "notes"/.test(error.message) && /name:/.test(error.message));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("readApps accepts an empty array", () => {
  const directory = mkdtempSync(join(tmpdir(), "nexus-apps-"));
  try {
    const path = join(directory, "apps.json");
    writeFileSync(path, "[]");
    assert.deepEqual(readApps(path), []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("empty list renders the empty state, the title, the description and no script", () => {
  const page = buildPage(template, [], footerOptions);
  assert.match(page, /No applications yet/);
  assert.doesNotMatch(page, /<ul class="app-grid">/);
  assert.match(page, /<h1>Mikrite <span class="nexus-word">Nexus<\/span><\/h1>/);
  assert.match(page, /<p class="intro-description">/);
  assert.doesNotMatch(page, /<script/i);
});

test("the theme switch offers Light and Dark as unchecked radios, with no script", () => {
  const page = buildPage(template, [], footerOptions);
  assert.match(page, /<legend class="sr-only">Theme<\/legend>/);
  const radios = page.match(/<input type="radio" name="theme"[^>]*>/g) || [];
  assert.equal(radios.length, 2);
  assert.match(radios[0], /class="theme-controller" value="nexus-light"/);
  assert.match(radios[1], /class="theme-controller" value="nexus-dark"/);
  assert.doesNotMatch(radios.join(""), /checked/);
  assert.doesNotMatch(page, /<script/i);
});

test("the stylesheet link carries the style version, so a changed CSS gets a new URL", () => {
  const page = buildPage(template, [], footerOptions);
  assert.match(page, /<link rel="stylesheet" href="style\.css\?v=abc123">/);
  assert.doesNotMatch(page, /href="style\.css"/);
});

test("stylesheetVersion is a short hash that changes with the CSS", () => {
  const version = stylesheetVersion("a{color:red}");
  assert.match(version, /^[0-9a-f]{10}$/);
  assert.equal(stylesheetVersion("a{color:red}"), version);
  assert.notEqual(stylesheetVersion("a{color:blue}"), version);
});

test("footer shows the year and version", () => {
  const footer = renderFooter(footerOptions);
  assert.match(footer, /Copyright © 2026 Mikrite/);
  assert.match(footer, /v0\.0\.0/);
});

test("a live entry renders one link with the entry href and accessible name", () => {
  const card = renderCard(livePart);
  assert.equal((card.match(/<a /g) || []).length, 1);
  assert.match(card, /href="\/tasks\/"/);
  assert.match(card, /aria-labelledby="app-tasks-name"/);
  assert.match(card, /<h3 class="app-card__title" id="app-tasks-name">Tasks<\/h3>/);
});

test("the grid preserves array order", () => {
  const grid = renderGrid([livePart, previewPart, unavailablePart]);
  const tasksAt = grid.indexOf("Tasks");
  const notesAt = grid.indexOf("Notes");
  const archiveAt = grid.indexOf("Archive");
  assert.ok(tasksAt < notesAt && notesAt < archiveAt);
});

test("a preview entry renders no link, is focusable and points at its status text", () => {
  const card = renderCard(previewPart);
  assert.doesNotMatch(card, /<a /);
  assert.match(card, /tabindex="0"/);
  assert.match(card, /aria-disabled="true"/);
  const describedBy = card.match(/aria-describedby="([^"]+)"/)[1];
  assert.match(card, new RegExp(`id="${describedBy}"`));
});

test("an unavailable entry without a mock-up renders the placeholder", () => {
  const card = renderCard(unavailablePart);
  assert.match(card, /Preview not available/);
  assert.doesNotMatch(card, /<a /);
});

test("a missing mock-up or thumbnail file fails the build and names the entry id", () => {
  const assetDirectory = mkdtempSync(join(tmpdir(), "nexus-assets-"));
  try {
    mkdirSync(join(assetDirectory, "mockups"));
    mkdirSync(join(assetDirectory, "thumbnails"));
    writeFileSync(join(assetDirectory, "thumbnails", "notes.webp"), "");
    assert.throws(() => assertAssetsExist([previewPart], assetDirectory), (error) => /entry "notes" mockup/.test(error.message));
    writeFileSync(join(assetDirectory, "mockups", "notes.svg"), "<svg/>");
    assert.doesNotThrow(() => assertAssetsExist([previewPart], assetDirectory));
    assert.throws(() => assertAssetsExist([withField(previewPart, "thumbnail", "missing.webp")], assetDirectory), (error) => /entry "notes" thumbnail/.test(error.message));
  } finally {
    rmSync(assetDirectory, { recursive: true, force: true });
  }
});
