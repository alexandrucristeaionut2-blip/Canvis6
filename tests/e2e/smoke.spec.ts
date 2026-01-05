import { test, expect } from "@playwright/test";
import { failOnConsoleErrors } from "./_console";

test("home loads", async ({ page }) => {
  failOnConsoleErrors(page);
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Fotografiile tale, transformate/i })
  ).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: /Creează tabloul tău/i })).toBeVisible();
});

test("gallery loads", async ({ page }) => {
  failOnConsoleErrors(page);
  await page.goto("/gallery");
  await expect(page.getByRole("heading", { name: "Gallery" })).toBeVisible();
});

test("themes loads", async ({ page }) => {
  failOnConsoleErrors(page);
  await page.goto("/themes");
  await expect(page.getByRole("heading", { name: "Themes" })).toBeVisible();
});

test("cart loads", async ({ page }) => {
  failOnConsoleErrors(page);
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();
});

test("checkout loads (no order)", async ({ page }) => {
  failOnConsoleErrors(page);
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  await expect(page.getByText("No order selected.")).toBeVisible();
});

test("create loads", async ({ page }) => {
  failOnConsoleErrors(page);
  await page.goto("/create");
  await expect(page.getByRole("button", { name: "Theme Alege o tematică" })).toBeVisible();
});
