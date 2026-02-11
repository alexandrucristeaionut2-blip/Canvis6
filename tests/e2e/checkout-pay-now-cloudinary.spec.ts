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
  await expect(page.getByText("Photos uploaded")).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("wizard-next").click();

  await page.getByTestId(`wizard-size-${size}`).click();
  await page.getByTestId("wizard-next").click();

  await page.getByTestId("wizard-frame-color").click();
  await page.getByRole("option", { name: /Black Matte/i }).click();
  await page.getByTestId("wizard-frame-model").click();
  await page.getByRole("option", { name: /Slim Modern/i }).click();
  await page.getByTestId("wizard-next").click();

  await page.getByTestId("wizard-add-to-cart").click();
  await expect(page.getByText(/Added to cart/i)).toBeVisible({ timeout: 10_000 });
}

test("checkout Pay now uploads originals to Cloudinary before payment", async ({ page }) => {
  failOnConsoleErrors(page);

  // Mock signing endpoint (avoids requiring real env + ensures deterministic params)
  await page.route("**/api/cloudinary/sign", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        cloudName: "dja4vgdjy",
        apiKey: "853623898375195",
        timestamp: 1700000000,
        signature: "test_signature",
        folder: "canvist/orders/cv-test/originals",
        tags: "canvist,order_cv-test",
      }),
    });
  });

  // Mock Cloudinary upload itself.
  let cloudinaryCounter = 0;
  await page.route("https://api.cloudinary.com/**", async (route) => {
    const url = route.request().url();
    if (!/\/image\/upload\b/i.test(url)) return route.fallback();
    cloudinaryCounter++;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        public_id: `canvist_test_${cloudinaryCounter}`,
        secure_url: `https://res.cloudinary.com/dja4vgdjy/image/upload/v1/canvist_test_${cloudinaryCounter}.jpg`,
        width: 1000,
        height: 1000,
        bytes: 1234,
        format: "jpg",
        resource_type: "image",
      }),
    });
  });

  await completeWizardToCart(page, "A4");

  await page.goto("/cart");
  await page.getByTestId("cart-checkout").click();
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

  const signReq = page.waitForRequest((r) => r.url().includes("/api/cloudinary/sign") && r.method() === "POST");
  const persistReq = page.waitForRequest((r) => /\/api\/orders\/.+\/items\/.+\/uploads$/.test(r.url()) && r.method() === "POST");
  const payReq = page.waitForRequest((r) => r.url().includes("/pay-mock") && r.method() === "POST");

  await expect(page.getByRole("button", { name: /^Pay now$/ })).toBeEnabled({ timeout: 20_000 });
  await page.getByTestId("checkout-pay").click();

  await signReq;
  await persistReq;
  await payReq;

  await expect(page).toHaveURL(/\/order\//, { timeout: 20_000 });
  await expect(page.getByText(/Awaiting previews/i)).toBeVisible({ timeout: 20_000 });
});
