import { expect, test, type Page } from "@playwright/test";

async function enterFauxGo(page: Page) {
  await page.goto("/");
  const home = page.getByTestId("home-screen");
  const enter = page.getByRole("button", { name: "Enter the imaginary city" });
  await expect(home.or(enter)).toBeVisible({ timeout: 15_000 });
  if (await enter.isVisible()) await enter.click();
  await expect(home).toBeVisible({ timeout: 15_000 });
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterFauxGo(page);
});

test("primary and service routes render without the native text overlay", async ({
  page,
}) => {
  const routes = [
    ["/", "home-screen"],
    ["/search", "search-screen"],
    ["/activity", "activity-screen"],
    ["/settings", "settings-screen"],
    ["/service/eats", "service-eats"],
    ["/service/market", "service-market"],
    ["/service/ride", "service-ride"],
  ] as const;
  for (const [path, testId] of routes) {
    await page.goto(path);
    await expect(page.getByTestId(testId)).toBeVisible();
    await expect(
      page.getByText("Unexpected text node", { exact: false }),
    ).toHaveCount(0);
  }
});

test("desktop rail truly contracts, navigates, and persists", async ({
  page,
}) => {
  const rail = page.getByRole("tablist");
  await expect(rail).toBeVisible();
  const expandFirst = page.getByRole("button", { name: "Expand navigation" });
  if (await expandFirst.isVisible()) await expandFirst.click();
  await expect
    .poll(() =>
      rail.evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeGreaterThan(140);
  const initialWidth = await rail.evaluate(
    (element) => element.getBoundingClientRect().width,
  );
  const expandedContent = await page
    .getByTestId("home-screen")
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, width: rect.width };
    });

  await page.getByRole("button", { name: "Collapse navigation" }).click();
  await expect
    .poll(() =>
      rail.evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeLessThan(initialWidth - 80);
  const collapsedContent = await page
    .getByTestId("home-screen")
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, width: rect.width };
    });
  expect(collapsedContent.x).toBeLessThan(expandedContent.x - 80);
  expect(collapsedContent.width).toBeGreaterThan(expandedContent.width + 80);

  await page.getByRole("tab", { name: "Search" }).click();
  await expect(page.getByTestId("search-screen")).toBeVisible();
  await page.getByRole("tab", { name: "Activity" }).click();
  await expect(page.getByTestId("activity-screen")).toBeVisible();
  await page.getByRole("tab", { name: "Settings" }).click();
  await expect(page.getByTestId("settings-screen")).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("button", { name: "Expand navigation" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      rail.evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeLessThan(100);
  await page.getByRole("button", { name: "Expand navigation" }).click();
  await expect
    .poll(() =>
      rail.evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeGreaterThan(140);
  expect(
    await page
      .locator("body")
      .evaluate((body) => body.scrollWidth <= window.innerWidth),
  ).toBe(true);
});
