import { expect, test } from "@playwright/test";

test("onboarding introduces the identity and studio credit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/onboarding");
  await expect(page.getByTestId("onboarding-screen")).toBeVisible();
  await expect(page).toHaveTitle(
    "FauxGo — All the journey. None of the going.",
  );
  await expect(
    page.getByRole("img", { name: "FauxGo", exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Made by Kaizun Labs", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Enter the imaginary city" }).click();
  await expect(page.getByTestId("home-screen")).toBeVisible();
});

test("branding fits mobile, tablet and desktop, and home links navigate", async ({
  page,
}) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "Enter the imaginary city" }).click();

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const homeLink = page.getByRole("link", {
      name: "FauxGo home",
      exact: true,
    });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute("href", "/");
    const bounds = await homeLink.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    expect(
      await page
        .locator("body")
        .evaluate((body) => body.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }

  await page.getByRole("link", { name: "About FauxGo", exact: true }).click();
  await expect(
    page.getByText("Made by Kaizun Labs", { exact: true }).last(),
  ).toBeVisible();
  await page.getByRole("link", { name: "FauxGo home", exact: true }).click();
  await expect(page.getByTestId("home-screen")).toBeVisible();

  await page.goto("/service/ride");
  await expect(page.getByTestId("service-ride")).toBeVisible();
  await page
    .getByRole("link", { name: "FauxGo home", exact: true })
    .press("Enter");
  await expect(page.getByTestId("home-screen")).toBeVisible();

  await page.goto("/settings");
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(
    page.getByRole("img", { name: "FauxGo", exact: true }).last(),
  ).toBeVisible();
  await expect(
    page.getByText("Made by Kaizun Labs", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "About FauxGo", exact: true }).click();
  await page.getByRole("link", { name: "FauxGo home", exact: true }).click();
  await expect(page.getByTestId("home-screen")).toBeVisible();
});
