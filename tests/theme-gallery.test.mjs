import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const html = await readFile(new URL("../public/theme-gallery.html", import.meta.url), "utf8");

test("gallery exposes two styles and two modes over the audited component families", () => {
  const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/theme-gallery.html" });
  const { document, Event } = dom.window;
  assert.deepEqual(
    [...document.querySelectorAll("#style-select option")].map((option) => option.value),
    ["v2", "neubrutal"],
  );
  assert.deepEqual(
    [...document.querySelectorAll("#mode-select option")].map((option) => option.value),
    ["light", "dark"],
  );
  for (const section of ["foundation", "shell", "buttons", "forms", "cards", "patterns", "data", "overlays", "content"]) {
    assert.ok(document.getElementById(section), section);
  }
  assert.ok(document.querySelectorAll("#card-grid [data-role]").length >= 16);
  const pageColor = () => dom.window.getComputedStyle(document.documentElement).getPropertyValue("--page").trim();
  assert.equal(pageColor(), "#fff8e7");
  const style = document.getElementById("style-select");
  const mode = document.getElementById("mode-select");
  style.value = "v2";
  style.dispatchEvent(new Event("change"));
  assert.equal(pageColor(), "#f7faff");
  mode.value = "dark";
  mode.dispatchEvent(new Event("change"));
  assert.equal(document.documentElement.dataset.style, "v2");
  assert.equal(document.documentElement.dataset.mode, "dark");
  assert.equal(document.getElementById("combination").textContent, "Modern V2 · Dark");
  assert.equal(pageColor(), "#24272c");
  style.value = "neubrutal";
  style.dispatchEvent(new Event("change"));
  assert.equal(pageColor(), "#141218");
  dom.window.close();
});

test("popover and dialog examples open and close", () => {
  const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/theme-gallery.html" });
  const { document, KeyboardEvent } = dom.window;
  document.getElementById("popover-trigger").click();
  assert.equal(document.getElementById("sample-popover").hidden, false);
  assert.equal(document.getElementById("popover-trigger").getAttribute("aria-expanded"), "true");
  document.getElementById("dialog-trigger").click();
  assert.equal(document.getElementById("dialog-backdrop").hidden, false);
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.equal(document.getElementById("dialog-backdrop").hidden, true);
  assert.equal(document.getElementById("sample-popover").hidden, true);
  dom.window.close();
});
