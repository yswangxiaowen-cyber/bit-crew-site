const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "script.js"), "utf8");
const data = JSON.parse(fs.readFileSync(path.join(root, "data/services.json"), "utf8"));
const target = (group) => ({ dataset: { serviceGroup: group }, innerHTML: "fallback" });

test("public pages request current asset revisions instead of cached older code and styles", () => {
  const revision = createHash("sha256").update(source).digest("hex").slice(0, 12);
  const styles = fs.readFileSync(path.join(root, "styles.css"));
  const styleRevision = createHash("sha256").update(styles).digest("hex").slice(0, 12);
  for (const page of ["index", "services", "products", "company", "recruit", "news"]) {
    const html = fs.readFileSync(path.join(root, `${page}.html`), "utf8");
    assert(html.includes(`src="script.js?v=${revision}"`), `${page}.html must load script revision ${revision}`);
    assert(html.includes(`href="styles.css?v=${styleRevision}"`), `${page}.html must load style revision ${styleRevision}`);
  }
});

async function render(services, ok = true) {
  const lists = [target("sap"), target("systems"), target()];
  const details = [target("sap"), target("systems")];
  const jump = target();
  const context = vm.createContext({
    document: {
      querySelector: (selector) => selector === "[data-services-jump]" ? jump : null,
      querySelectorAll: (selector) => ({
        "[data-services-list]": lists,
        "[data-services-detail]": details,
      })[selector] || [],
    },
    fetch: async () => ({ ok, json: async () => ({ services }) }),
    console: { warn() {} },
  });
  vm.runInContext(source, context);
  await vm.runInContext("loadServices()", context);
  return { lists, details, jump };
}

test("published services render once in the assigned group and retain all jump links", async () => {
  const { lists, details, jump } = await render(data.services);
  assert.equal(data.services.filter((item) => item.group === "sap").length, 3);
  assert.equal(data.services.filter((item) => item.group === "systems").length, 1);
  for (const item of data.services) {
    for (const [index, group] of ["sap", "systems"].entries()) {
      assert.equal(lists[index].innerHTML.includes(`services.html#${item.slug}`), item.group === group);
      assert.equal(details[index].innerHTML.includes(`id="${item.slug}"`), item.group === group);
    }
    assert(lists[2].innerHTML.includes(`services.html#${item.slug}`));
    assert(jump.innerHTML.includes(`href="#${item.slug}"`));
  }
});

test("a CMS category change moves the service without changing its link or escaping", async () => {
  const moved = { ...data.services[0], group: "systems", title: '<img src=x> & "quoted"' };
  const { lists, details } = await render([moved]);
  assert.equal(lists[0].innerHTML, "");
  assert.equal(details[0].innerHTML, "");
  assert(lists[1].innerHTML.includes(`services.html#${moved.slug}`));
  assert(lists[1].innerHTML.includes("お客様向けの開発支援"));
  assert(lists[1].innerHTML.includes("&lt;img src=x&gt; &amp; &quot;quoted&quot;"));
  assert(details[1].innerHTML.includes(`id="${moved.slug}"`));
});

test("a failed data load preserves the static fallback in both groups", async () => {
  const { lists, details, jump } = await render([], false);
  for (const element of [...lists, ...details, jump]) assert.equal(element.innerHTML, "fallback");
});
