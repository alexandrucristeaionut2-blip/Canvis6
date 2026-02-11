import { test, expect } from "@playwright/test";
import path from "node:path";
import { failOnConsoleErrors } from "./_console";

async function completeWizardToCart(page: import("@playwright/test").Page, size: "A4" | "A3") {
  await page.goto("/create");

  await page.getByRole("button", { name: /1930s Noir/i }).click();
  await page.getByTestId("wizard-next").click();

  const file1 = path.join(process.cwd(), "public", "examples", "good-photo-1.png");
  const file2 = path.join(process.cwd(), "public", "examples", "good-photo-2.png");

  const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.getByTestId("wizard-add-photos").click()]);
  await chooser.setFiles([file1, file2]);

  // Wait on UI state instead of network predicates (more stable in dev-server mode).
  await expect(page.getByText("Photos uploaded")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("good-photo-1.png")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("good-photo-2.png")).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("wizard-next").click();

  await page.getByTestId(`wizard-size-${size}`).click();
  await page.getByTestId("wizard-next").click();

  // Frame options are mandatory.
  await page.getByTestId("wizard-frame-color").click();
  await page.getByRole("option", { name: /Black Matte/i }).click();
  await page.getByTestId("wizard-frame-model").click();
  await page.getByRole("option", { name: /Slim Modern/i }).click();
  await page.getByTestId("wizard-next").click();

  await page.getByTestId("wizard-add-to-cart").click();
  await expect(page.getByText(/Added to cart/i)).toBeVisible({ timeout: 10_000 });
}

test("A4 flow: create -> cart -> checkout -> pay -> order", async ({ page }) => {
  failOnConsoleErrors(page);

  await completeWizardToCart(page, "A4");

  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();
  await expect(page.getByText(/1930s Noir/i)).toBeVisible();
  await expect(page.getByText(/89[\.,]99/i).first()).toBeVisible();

  // Cart should persist on refresh.
  await page.reload();
  await expect(page.getByText(/1930s Noir/i)).toBeVisible();

  await page.getByTestId("cart-checkout").click();
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

  // Pay and land on the order page.
  await expect(page.getByTestId("checkout-pay")).toBeEnabled({ timeout: 20_000 });
  await page.getByTestId("checkout-pay").click();
  await expect(page).toHaveURL(/\/order\//, { timeout: 20_000 });
  await expect(page.getByText(/Awaiting previews/i)).toBeVisible();

  // Cart should be cleared after paying from cart.
  await page.goto("/cart");
  await expect(page.getByText(/Your cart is empty/i)).toBeVisible();
});

test("A3 flow: create -> cart totals reflect A3 pricing", async ({ page }) => {
  failOnConsoleErrors(page);

  await completeWizardToCart(page, "A3");
  await page.goto("/cart");
  await expect(page.getByText(/1930s Noir/i)).toBeVisible();
  await expect(page.getByText(/129[\.,]99/i).first()).toBeVisible();
});
