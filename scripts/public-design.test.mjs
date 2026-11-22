import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { createServer } from "../server.mjs";
const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");
const pages = [
  "index",
  "about",
  "courses",
  "study-in-japan",
  "student-life",
  "news",
  "contact",
  "privacy",
];
const siteScript = await read("site.js");
const css = await read("style.css");
function mediaMatches(query, width) {
  return [...query.matchAll(/(min|max)-width:\s*(\d+)px/g)].every(
    ([, type, value]) => (type === "min" ? width >= +value : width <= +value),
  );
}
function declaration(rules, selector, property, width) {
  let value;
  for (const rule of rules) {
    if (rule.media && mediaMatches(rule.conditionText, width))
      value = declaration(rule.cssRules, selector, property, width) ?? value;
    else if (
      rule.selectorText
        ?.split(",")
        .map((s) => s.trim())
        .includes(selector) &&
      rule.style.getPropertyValue(property)
    )
      value = rule.style.getPropertyValue(property);
  }
  return value;
}
test("responsive layouts switch at phone, tablet and desktop widths", () => {
  const dom = new JSDOM("<style>" + css + "</style>");
  const rules = dom.window.document.styleSheets[0].cssRules;
  for (const width of [320, 375, 390, 680, 768, 960, 1024, 1180, 1440]) {
    assert.equal(
      declaration(rules, ".course-grid", "grid-template-columns", width),
      "repeat(2, minmax(0, 1fr))",
    );
    assert.equal(
      declaration(rules, ".menu", "display", width),
      width <= 800 ? "grid" : "none",
    );
    assert.equal(
      declaration(rules, ".registration-grid", "grid-template-columns", width),
      width <= 680 ? "1fr" : "repeat(2, minmax(0, 1fr))",
    );
    assert.equal(
      declaration(rules, ".hero", "grid-template-columns", width),
      width <= 680 ? "1fr" : width > 1180 ? "1fr 1.03fr" : "1.05fr 1fr",
    );
  }
  dom.window.close();
});
test("every public page has working menu dismissal, focus restore and resize reset", async () => {
  for (const page of pages) {
    const dom = new JSDOM(await read(page + ".html"), {
      url: "http://localhost/" + (page === "index" ? "" : page),
      runScripts: "outside-only",
    });
    let resize;
    dom.window.matchMedia = () => ({
      addEventListener(_, fn) {
        resize = fn;
      },
    });
    dom.window.eval(siteScript);
    const doc = dom.window.document,
      button = doc.querySelector(".menu"),
      nav = doc.querySelector("nav");
    assert.ok(
      [...doc.querySelectorAll(".reveal-item")].every((item) =>
        item.classList.contains("is-visible"),
      ),
    );
    assert.ok(doc.querySelector("meta[name=viewport]"));
    assert.equal(doc.querySelectorAll("link[rel=stylesheet]").length, 1);
    assert.ok(doc.querySelector("#main-content"));
    button.click();
    assert.equal(button.getAttribute("aria-expanded"), "true");
    assert.ok(nav.classList.contains("mobile-open"));
    doc.dispatchEvent(
      new dom.window.KeyboardEvent("keydown", { key: "Escape" }),
    );
    assert.equal(button.getAttribute("aria-expanded"), "false");
    assert.equal(doc.activeElement, button);
    button.click();
    resize({ matches: true });
    assert.equal(button.getAttribute("aria-expanded"), "false");
    button.click();
    doc.querySelector("main").click();
    assert.equal(button.getAttribute("aria-expanded"), "false");
    dom.window.close();
  }
});
test("N5 and N4 course links retain their selected level through registration", async () => {
  const home = new JSDOM(await read("index.html"), {
    url: "http://localhost/",
    runScripts: "outside-only",
  });
  home.window.eval(await read("app.js"));
  assert.equal(home.window.document.querySelectorAll(".course-card").length, 2);
  assert.equal(
    home.window.document.querySelector(".course-card").getAttribute("href"),
    "/courses#N5",
  );
  const dom = new JSDOM(await read("courses.html"), {
    url: "http://localhost/courses",
    runScripts: "outside-only",
  });
  dom.window.eval(await read("pages.js"));
  const filter = dom.window.document.querySelector("#level-filter");
  filter.value = "N4";
  filter.dispatchEvent(new dom.window.Event("change"));
  assert.equal(
    dom.window.document.querySelectorAll(".course-detail").length,
    1,
  );
  assert.equal(dom.window.document.querySelector(".course-detail").id, "N4");
  assert.equal(
    dom.window.document.querySelector(".course-detail a").getAttribute("href"),
    "/register?course=N4",
  );
  dom.window.close();
  home.window.close();
});
test("public routes, navigation links and assets return successful responses", async () => {
  const server = createServer({
    dbPath: ":memory:",
    skipImport: true,
    allowSend: false,
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = "http://127.0.0.1:" + server.address().port;
  try {
    const urls = new Set([
      "/style.css",
      "/site.js",
      "/app.js",
      "/pages.js",
      "/reference.jpeg",
      "/homepage-reference.png",
    ]);
    for (const page of pages) {
      const route =
        page === "index"
          ? "/"
          : "/" + page;
      urls.add(route);
      const dom = new JSDOM(await read(page + ".html"), {
        url: origin + route,
      });
      for (const link of dom.window.document.querySelectorAll(
        "a[href],script[src],link[href]",
      )) {
        const url = new URL(link.href || link.src);
        if (url.origin === origin) urls.add(url.pathname + url.search);
      }
      dom.window.close();
    }
    for (const route of urls) {
      const response = await fetch(origin + route);
      assert.equal(response.status, 200, route);
      await response.arrayBuffer();
    }
  } finally {
    await new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });
  }
});
