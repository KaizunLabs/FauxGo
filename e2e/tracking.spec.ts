import { expect, test } from "@playwright/test";

test("simulated driver approaches pickup and waits for an explicit ride start", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "Enter the imaginary city" }).click();
  await page.goto("/service/ride");
  await page.getByTestId("service-ride").waitFor();
  await page
    .getByRole("button", {
      name: /Juniper Square|Harbor Library|Museum of Small Things/,
    })
    .first()
    .click();
  await page.getByRole("button", { name: "Review booking" }).click();
  await page.getByTestId("checkout-screen").waitFor();
  await page.getByRole("button", { name: "Confirm ride" }).click();
  await expect(page.getByTestId("tracking-screen")).toBeVisible();
  await expect(
    page.getByText("Finding a driver", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Quick messages")).toHaveCount(0);
  await expect(page.getByText(/To pickup · Illustrative route/)).toBeVisible();

  await page.clock.fastForward(10_000);
  await expect(page.getByText("Driver assigned")).toBeVisible();
  await expect(page.getByText("Quick messages")).toBeVisible();
  await page.getByRole("button", { name: "I’m here" }).click();
  await expect(page.getByText(/meet you at the selected point/)).toBeVisible();

  await page.clock.fastForward(30_000);
  await expect(page.getByRole("button", { name: "Start ride" })).toBeVisible();
  await expect(page.getByText("Driver at pickup")).toBeVisible();
  await page.getByRole("button", { name: "Start ride" }).click();
  await expect(page.getByText("Ride started")).toBeVisible();
  await expect(
    page.getByText(/To destination · Illustrative route/),
  ).toBeVisible();
});
