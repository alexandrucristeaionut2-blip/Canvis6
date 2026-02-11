import { test, expect } from "@playwright/test";
import { failOnConsoleErrors } from "./_console";

test("/create: Pay now is only in checkout", async ({ page }) => {
  failOnConsoleErrors(page);

  await page.goto("/create");

  await expect(page.getByRole("button", { name: /^Pay now$/ })).toHaveCount(0);
});
