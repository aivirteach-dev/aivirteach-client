import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);

async function request(path) {
  const url = new URL(workerUrl);
  url.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(url.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

for (const [path, expected] of [
  ["/login", "Turn AI Learners into AI Builders"],
  ["/dashboard", "Loading your learning"],
  ["/analysis", "Learning Analytics"],
  ["/courses", "Choose what to learn next"],
  ["/courses/welcome", "Preparing your course"],
  ["/settings", "Settings"],
  ["/theme-gallery", "One UI, four combinations"],
  ["/workspace", "Opening Learning Lab"],
]) {
  test(`renders ${path}`, async () => {
    const response = await request(path);
    assert.equal(response.status, 200);
    assert.match(await response.text(), new RegExp(expected));
  });
}

test("live gallery renders website card components and theme controls", async () => {
  const response = await request("/theme-gallery");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const section of ["foundation", "shell", "buttons", "forms", "cards", "patterns", "data", "overlays", "content"]) {
    assert.match(html, new RegExp(`id="${section}"`));
  }
  assert.match(html, /class="gallery-toolbar"/);
  assert.match(html, /data-slot="button"/);
  assert.match(html, /data-slot="select"/);
  assert.match(html, /data-ui-role="dashboard-course"/);
  assert.match(html, /class="[^"]*course-card/);
  assert.match(html, /data-ui-role="catalog-course"/);
  assert.match(html, /class="[^"]*catalog-card/);
  assert.match(html, /Save site-wide to repo/);
});

test("old gallery URL redirects to the live route", async () => {
  const response = await request("/theme-gallery.html");
  assert.ok(response.status >= 300 && response.status < 400);
  assert.equal(new URL(response.headers.get("location"), "http://localhost").pathname, "/theme-gallery");
});

test("does not expose the retired frontend mock profile API", async () => {
  const response = await request("/api/mock/profile");
  assert.equal(response.status, 404);
});
