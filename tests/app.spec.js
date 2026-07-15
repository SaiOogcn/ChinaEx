import { expect, test } from "@playwright/test";

test("legacy hash migrates with 34 region levels intact", async ({ page }) => {
  const legacy = `5${"0".repeat(33)}`;
  await page.goto(`/#${legacy}`);
  await expect(page.locator(".province")).toHaveCount(34);
  await expect(page.locator(".province").first()).toHaveClass(/red/);
  await expect(page.locator("#level")).toHaveText("5");
  await expect(page).toHaveURL(new RegExp(`#v=2&l=${legacy}&lang=zh`));
});


test("legacy local storage and query name migrate to the versioned state", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("chinaex-levels", JSON.stringify({ ["\u9ed1\u9f99\u6c5f"]: "orange" }));
    localStorage.setItem("chinaex-lang", "en");
  });
  await page.goto("/?t=Alex");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".province").first()).toHaveClass(/orange/);
  await expect(page.locator("#level")).toHaveText("4");
  await expect(page).toHaveURL(/#v=2&l=4.*&lang=en&n=Alex/);
});

test("path, label, and keyboard selection update the state and share URL", async ({ page }) => {
  await page.goto("/");
  const firstProvince = page.locator(".province").first();
  await firstProvince.click();
  await expect(page.locator("#region-card")).toHaveClass(/is-open/);
  await page.locator("#level-options button").first().click();
  await expect(page.locator("#level")).toHaveText("5");
  await expect(page.locator("#visited")).toContainText("1/34");
  await expect(page).toHaveURL(/#v=2&l=5/);

  await page.locator("#close-region").click();
  await firstProvince.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#region-card")).toHaveClass(/is-open/);
  await page.locator("#close-region").click();

  await page.locator(".map-label").nth(1).click();
  await expect(page.locator("#region-card")).toHaveClass(/is-open/);
});

test("English rendering supplies readable region labels and translated controls", async ({ page }) => {
  await page.goto("/");
  await page.locator("#btn-language").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#btn-copy")).toHaveText("Copy link");
  await expect(page.locator("#action-dock")).toHaveAttribute("aria-label", "Actions");
  await expect(page.locator("#meta-description")).toHaveAttribute("content", /maps your experience/i);
  await expect(page.locator("#legend")).toContainText("Lived there");
  await expect(page.locator(".map-label").first()).toContainText("Heilongjiang");
  await page.locator(".map-label").nth(1).click();
  await expect(page.locator("#region-name")).toContainText("Jilin");
  await expect(page.locator("#region-search")).toHaveAttribute("href", /google\.com\/search/);
});

test("overview and interaction targets stay inside the usable viewport", async ({ page }) => {
  await page.goto("/");
  const geometry = await page.evaluate(() => {
    const rect = (element) => { const { left, top, right, bottom } = element.getBoundingClientRect(); return { left, top, right, bottom }; };
    const svg = rect(document.querySelector("#svg"));
    const regions = [...document.querySelectorAll(".province")].map(rect);
    const union = regions.reduce((all, current) => ({
      left: Math.min(all.left, current.left), top: Math.min(all.top, current.top),
      right: Math.max(all.right, current.right), bottom: Math.max(all.bottom, current.bottom)
    }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
    const dock = rect(document.querySelector(".action-dock"));
    return { svg, union, dock };
  });
  expect(geometry.union.left).toBeGreaterThanOrEqual(geometry.svg.left - 1);
  expect(geometry.union.right).toBeLessThanOrEqual(geometry.svg.right + 1);
  expect(geometry.union.top).toBeGreaterThanOrEqual(geometry.svg.top - 1);
  expect(geometry.union.bottom).toBeLessThanOrEqual(geometry.svg.bottom + 1);
  expect(geometry.union.bottom).toBeLessThanOrEqual(geometry.dock.top - 4);
});

test("name and reset dialogs replace browser prompts", async ({ page }) => {
  await page.goto("/");
  await page.locator("#btn-name").click();
  await expect(page.locator("#name-dialog")).toHaveAttribute("open", "");
  await page.locator("#name-input").fill("Alex");
  await page.locator("#name-save").click();
  await expect(page.locator("#name-dialog")).not.toHaveAttribute("open", "");
  await expect(page).toHaveURL(/n=Alex/);
  await page.locator("#btn-reset").click();
  await expect(page.locator("#reset-dialog")).toHaveAttribute("open", "");
});


test("SVG export contains the current English export index", async ({ page }) => {
  await page.goto("/#v=2&l=5000000000000000000000000000000000&lang=en&n=Alex");
  await page.locator("#btn-export").click();
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#btn-export-svg").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.svg$/);
  const stream = await download.createReadStream();
  let source = "";
  for await (const chunk of stream) source += chunk;
  expect(source).toContain("Short-name index");
  expect(source).toContain("Beij.");
  expect(source).toContain("Beijing");
});

test("fit map resets a zoomed viewport", async ({ page }) => {
  await page.goto("/");
  const svg = page.locator("#svg");
  const box = await svg.boundingBox();
  await page.mouse.dblclick(box.x + box.width * .35, box.y + box.height * .45);
  await expect(svg).toHaveClass(/is-zoomed/);
  await page.locator("#fit-map").click();
  await expect(svg).not.toHaveClass(/is-zoomed/);
  await expect(page.locator("#map-content")).toHaveAttribute("transform", "translate(0 0) scale(1)");
});


test("landscape overview stays clear of the action dock", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/");
  const geometry = await page.evaluate(() => {
    const rect = (element) => { const { left, top, right, bottom } = element.getBoundingClientRect(); return { left, top, right, bottom }; };
    const svg = rect(document.querySelector("#svg"));
    const dock = rect(document.querySelector(".action-dock"));
    const regions = [...document.querySelectorAll(".province")].map(rect);
    const union = regions.reduce((all, current) => ({
      left: Math.min(all.left, current.left), top: Math.min(all.top, current.top),
      right: Math.max(all.right, current.right), bottom: Math.max(all.bottom, current.bottom)
    }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
    return { svg, dock, union };
  });
  expect(geometry.union.left).toBeGreaterThanOrEqual(geometry.svg.left - 1);
  expect(geometry.union.right).toBeLessThanOrEqual(geometry.svg.right + 1);
  expect(geometry.union.top).toBeGreaterThanOrEqual(geometry.svg.top - 1);
  expect(geometry.union.bottom).toBeLessThanOrEqual(geometry.svg.bottom + 1);
  expect(geometry.union.bottom).toBeLessThanOrEqual(geometry.dock.top - 4);
});
